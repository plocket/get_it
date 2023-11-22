const puppeteer = require(`puppeteer`);
const fs = require(`fs`);
require(`dotenv`).config();

// TODO: scroll to find channel

/*
TODO: download files
In messages (in a message, even?):

Get all action buttons in message:
  in message node
    Reveal unexpanded
      <button class="c-button-unstyled c-icon_button c-icon_button--size_medium c-message_kit__file__meta__collapse c-icon_button--default" aria-label="Toggle file" aria-expanded="false" data-qa="file-collapse-button" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" d="M13.22 9.423a.75.75 0 0 1 .001 1.151l-4.49 3.755a.75.75 0 0 1-1.231-.575V6.25a.75.75 0 0 1 1.23-.575l4.49 3.747Z"></path></svg></button>
    Get thread link
    jpg
      document.querySelectorAll(`.c-file__actions`) or
      data-qa="more_file_actions" .click() or
      aria-label="different_kind_of_tags_maybe.png: More actions"
    video
      aria-label="More actions"
    pdf
      aria-label="209a_258e_motion_for_impoundment.pdf: More actions"
Get the action to open in thread:
  jpg
    button[data-qa="view_file_details"] or
    <button class="c-button-unstyled c-menu_item__button" id="menu-192-1" data-qa="view_file_details" role="menuitem" tabindex="-1" type="button"><div class="c-menu_item__label">View file details</div></button>
  video
    <button class="c-button-unstyled c-menu_item__button" id="menu-165-2" data-qa="menu_item_button" role="menuitem" tabindex="-1" type="button"><div class="c-menu_item__label">View details</div></button>
Press download? How to download
  `*[data-qa="download_action"]`
    link href="https://files.slack.com/files-pri/T024F66L9-F02UT2JEM9V/download/file_from_ios.mp4?origin_team=T024F66L9"
    opens new window sometimes (always?). What to do about that?
    Maybe this:
    // Get the file content
    const fileContent = await page.evaluate(() => {
      return fetch(url, {
        method: 'GET',
        credentials: 'include'
      }).then(r => r.text());
    });
    // Write the file content to the local file system
    fs.writeFileSync(outputFilename, fileContent);
*/

/*
TODO: Avoid computer sleep?
https://www.phind.com/search?cache=fa44k6upsvm5wusle7y27ix7

Maybe for mac:
caffeinate -i node your-script.js

const { exec } = require('child_process');

// Function to prevent the computer from sleeping
function preventSleep() {
 if (process.platform === 'darwin') {
   // macOS
   exec('caffeinate -i -t 3600');
 } else if (process.platform === 'win32') {
   // Windows
   exec('powercfg /change standby-timeout-ac 0');
   exec('powercfg /change hibernate-timeout-ac 0');
 } else {
   console.log('Unsupported platform');
 }
}

// Call the function to prevent the computer from sleeping
preventSleep();

This script checks the platform of the operating system and runs the appropriate command to prevent the computer from sleeping. The -t 3600 option in the caffeinate command tells the system to sleep after an hour, which effectively prevents the computer from sleeping while the script is running. The standby-timeout-ac and hibernate-timeout-ac options in the powercfg command tell the system to never go to sleep while plugged in 4.

Please note that these commands need to be run with administrator privileges. If you're running your script from the command line, you may need to run it with sudo on macOS or as an administrator on Windows.

Also, this solution does not revert the sleep settings back to their original state when the script finishes running. If you want to do this, you would need to save the original sleep settings before running the script and then restore them afterwards. This would require additional system-specific commands, and it's not straightforward to do this in a cross-platform way.
*/

// TODO: config is really args?
let config = JSON.parse(fs.readFileSync(`./config.json`));
let state = JSON.parse(fs.readFileSync(`./${ config.state_path }`));
let page = null;

const CHANNEL_SCROLLER_SELECTOR = `.p-workspace__primary_view_body .c-scrollbar__hider`;

async function start() {
  log.debug(`start()`);

  const browser = await puppeteer.launch({
    // Have to interact with the browser prompt manually
    headless: !process.env.DEBUG,
    devtools: process.env.DEBUG,
  });
  page = await browser.newPage();

  // // Prepare for future downloading
  // await page._client.send(`Page.setDownloadBehavior`, {
  //   behavior: `allow`,
  //   downloadPath: `./data/${ state.current_channel }/downloads`,
  // });

  // Make very big viewport?
  await page.setViewport({ height: config.viewport_height, width: 1000 });
  process.stdout.write(`\x1b[36m${ 'Starting... ' }\x1b[0m`);
  await log_in();
  // TODO: Create folder for channel if it doesn't exist
  // TODO: loop through channels
  await go_to_channel({ channel_name: state.current_channel });
  process.stdout.write(`\x1b[36m${ 'Now-ish! ' }\x1b[0m`);
  await collect_channel({ config, state });
  process.stdout.write(`\x1b[36m${ ' Done. Everything is probably fine.' }\x1b[0m`);

  browser.close();
};

async function log_in() {
  log.debug(`log_in()`);
  await page.goto(process.env.WORKSPACE, { waitUntil: `domcontentloaded` });
  // Choose to log in by email
  let [email_reponse] = await Promise.all([
    page.waitForNavigation({ waitUntil: `domcontentloaded` }),
    page.click(`input[type="submit"]`),
  ]);
  // Log in
  let response = await auth();
  await wait_for_load({ seconds: .5 });
  return page;
};

async function auth() {
  await page.type(`input#email`, process.env.EMAIL);
  await page.type(`input#password`, process.env.PASSWORD);
  // Submit and go to workspace
  let [auth_reponse] = await Promise.all([
    page.waitForNavigation({ waitUntil: `domcontentloaded` }),
    page.click(`button[type="submit"]`),
  ]);
  await wait_for_load({ seconds: 20 });
  return auth_reponse;
}

async function go_to_channel({ channel_name }) {
  /** Click on channel link */
  log.debug(`go_to_channel()`);
  await page.click(`span[data-qa="channel_sidebar_name_${ channel_name }"]`);
};

async function collect_channel({ config, state }) {
  /** Collect all data from the start to the the scroll distance */
  log.debug(`collect_channel()`);

  const goal_position = get_channel_goal ({
    position: state.position,
    // `config.max_travel_pixels`? `config.max_travel/distance_wanted`?
    max_distance_wanted: config.travel_distance,
  })
  await scroll_to_start({ state, config });
  // Are we already finished?
  let reached_goal = await reached_channel_goal({ position: state.position, goal_position });

  // Go once, reach end, go once more. Deduplicate during processing.
  let final_round_done = false;
  while ( !final_round_done ) {
    // If reached bottom in previous scroll, finish this round and then stop
    final_round_done = reached_goal;

    // Collect current view's elements
    let messages = await get_message_container_data();  // name? `get_current_messages_data`
    let threads = await collect_threads({ ids: messages.reply_ids });  // `collect_message_threads`?
    // Save in case of errors or computers going to sleep
    save_data({
      config, state,
      data: { messages: messages.html, threads }
    });
    // Scroll to new spot
    let scroller_handle = await page.waitForSelector(CHANNEL_SCROLLER_SELECTOR);
    state.position += await scroll_towards({
      goal_position, position: state.position, scroller_handle 
    });
    // Save new start for next run of loop or script
    save_state({ config, state });
    process.stdout.write(`\x1b[36m${ 'M' }\x1b[0m`);

    // Decide if this is the last section we'll need to collect
    reached_goal = await reached_channel_goal({ position: state.position, goal_position });
  }  // ends while need to collect
};  // Ends collect_channel()

async function scroll_to_start ({ state, config }) {
  log.debug(`scroll_to_start()`);
  // Sometimes page refuses to go a long distance in one go
  let position = 0;
  let goal_position = state.position;
  let scroller_handle = await page.waitForSelector(CHANNEL_SCROLLER_SELECTOR);
  while ( !await reached_channel_goal({ position, goal_position }) ) {
    position += await scroll_towards({
      position, goal_position, scroller_handle 
    });
  }
};

async function scroll_towards ({ position, goal_position, scroller_handle }) {
  /** Returns new position int */
  log.debug(`scroll_towards()`);
  const scroller_height = await scroller_handle.evaluate( (element) => {
    return element.clientHeight;
  });
  // soooooo nested
  const distance = calculate_scroll_distance({
    current_position: position,
    goal_position,
    scroller_height
  });
  await scroller_handle.evaluate( (element, { distance }) => {
    element.scrollBy(0, distance);
  }, { distance });
  await wait_for_movement({ seconds: 1 });

  return distance;
}

function get_channel_goal ({ position, max_distance_wanted }) {
  log.debug(`get_channel_goal()`);
  // In case travel_distance is `end` or something (to inifitely scroll to the top)
  if ( typeof max_distance_wanted === `string` ) {
    return max_distance_wanted
  } else {
    const direction_up = -1;
    const positive_goal = Math.abs(position) + Math.abs(max_distance_wanted)
    return direction_up * positive_goal;
  }
}

function calculate_scroll_distance ({ current_position, goal_position, scroller_height }) {
  log.debug(`calculate_scroll_distance(): goal_position ${goal_position}, pos ${current_position}, diff ${goal_position - current_position}`);
  // Don't overshoot. Math justification:
  // goal_position = 10, current_position = 1, distance = 20, desired = 9
  // goal_position = 100, current_position = 1, distance = 20, desired = 20
  // min( 10 - 1, 20) = 9, min( 100 - 1, 20) = 20
  const direction_up = -1;

  // TODO: Can we correctly calculate `goal_position` based on top
  // element before getting in here?
  // If dev wants to get to the top, scroll the maximum distance allowed
  if ( [ `end`, `top`, `infinite`, `all` ].includes( goal_position ) ) {
    log.debug(`scroll distance (scroller height): ${ direction_up * scroller_height }`);
    return direction_up * scroller_height;
  }

  // Math.abs: Make sure direction of these individual items doesn't matter
  const positive_distance_to_goal = Math.abs( goal_position - current_position );
  const positive_actual_distance = Math.min(
    positive_distance_to_goal, scroller_height
  );
  log.debug(`scroll distance (min): ${ direction_up * positive_actual_distance }`);
  return direction_up * positive_actual_distance;
}

async function reached_channel_goal ({ position, goal_position }) {
  log.debug(`reached_channel_goal()`);
  let reached_end = false;
  let top = await page.$(`h1.p-message_pane__foreword__title`);
  if ( top ) {
    log.debug(`--- at top of channel ---`);
    reached_end = true;
  } else if ( [ `end`, `top`, `infinite`, `all` ].includes( goal_position ) ) {
    // Those strings means the dev wants to get all the way to the top.
    // Return false since we're not at the top.
    reached_end = false;
  } else {
    reached_end = Math.abs(position) >= Math.abs(goal_position);
  }
  log.debug(`reached_channel_goal(): position: ${ position }, goal_position: ${ goal_position }, reached_end: ${reached_end}`);
  return reached_end;
}

async function get_message_container_data () {
  log.debug(`get_message_container_data()`);
  let handle = await page.waitForSelector(`.p-workspace__primary_view_body`);
  let data = await handle.evaluate((elem) => {
    let messages = elem.querySelectorAll(`.c-virtual_list__item:has(.c-message__reply_count)`);
    // DOM id of the messages with replies (and therefore threads)
    let reply_ids = Array.from(messages).map((item) => {return item.id});
    return {
      html: elem.outerHTML,
      reply_ids,
    }
  });
  return data;
}

async function collect_threads ({ ids }) {
  log.debug(`collect_threads()`);
  let threads = {};
  // Click on each thread
  for ( let id of ids ) {
    let thread_handle = await open_thread({ id });
    let data = await collect_thread({ thread_handle, id });
    await close_thread({ thread_handle });
    process.stdout.write(`\x1b[36m${ 't' }\x1b[0m`);
    threads[id] = data;
  }
  return threads;
}

async function open_thread ({ id }) {
  log.debug(`open_thread() id: ${ id }`);
  // Note: page.$() as querySelectorAll won't work with these
  // ids (Example id: 1668547054.805359).
  await page.evaluate((id) => {
    let elem = document.getElementById(id);
    elem.querySelector('.c-message__reply_count').click();
  }, id);
  await wait_for_movement({ seconds: 2 });
  let thread_handle = await page.waitForSelector(`div[data-qa="threads_flexpane"]`);
  log.debug(`thread_handle: ${ id }`);
  return thread_handle
}

async function collect_thread ({ thread_handle, id }) {
  log.debug(`collect_thread()`);
  let thread_items = [];
  let position = 0;
  let reached_end = await reached_thread_top({ thread_handle, id });

  // Go once, reach end, go once more. Deduplicate during processing.
  let final_round_done = false;
  while ( !final_round_done ) {
    // If reached bottom in previous scroll, finish this round and then stop
    final_round_done = reached_end;
    // Collect where we are
    let thread_contents = await thread_handle.evaluate((elem) => {
      return elem.outerHTML
    });
    // Scroll to new spot
    position = await scroll_thread({ position, thread_handle });
    thread_items.push( thread_contents );
    // Decide if this is the last section we'll need to collect
    reached_end = await reached_thread_top({ thread_handle, id });
  }
  return thread_items;
}

async function reached_thread_top ({ thread_handle, id }) {
  log.debug(`reached_thread_top() id:`, id);
  let top_handle = await thread_handle.$(`div[data-item-key="${id}"]`);
  log.debug(`top handle exists? (reached thread top): ${!!top_handle}, handle:`, top_handle);
  return !!top_handle;
}

async function scroll_thread ({ position, thread_handle }) {
  log.debug(`scroll_thread()`);
  const scroller_handle = await thread_handle.waitForSelector(`.c-scrollbar__hider`);
  position += await scroll_towards({ position, goal_position: `top`, scroller_handle });
  log.debug(`new_position: ${ position }`);
  return position;
}

async function close_thread ({ thread_handle }) {
  /** The width of the viewport is affected by opening a thread,
  *   scrolling the messages. Undo that. */
  log.debug(`close_thread()`);
  await thread_handle.evaluate((elem) => {
    elem.querySelector('button[data-qa="close_flexpane"]').click();
  });
  await wait_for_movement({ seconds: 1 });
}

async function wait_for_movement ({ seconds }) {
  /** Wait, but with a clearer name. **/
  log.debug(`wait_for_movement()`);
  await wait_for_load({ seconds });
}

async function wait_for_load ({ seconds }) {
  /** Wait, but with a clearer name. **/
  log.debug(`wait_for_load()`);
  await page.waitForTimeout( 1000 * seconds );
}

function save_data ({ config, state, data }) {
  /** `data` {obj} - .messages and .threads */
  log.debug(`save_data()`);

  let folder_path = `data/${ state.current_channel }`;
  ensure_dir_exists({ dir_path: folder_path })

  // List of message groups html
  const msgs_file_path = `${ folder_path }/${ config.messages_path }`;
  // const messages = JSON.parse( fs.readFileSync( msgs_file_path )) || [];
  const messages = get_value_safely({ file_path: msgs_file_path, default_value: [] });
  messages.unshift( data.messages );
  write_files_safely({
    file_path: msgs_file_path,
    contents: JSON.stringify( messages, null, 2 ),
  });

  // Object of threads' html by id
  const threads_file_path = `${ folder_path }/${ config.threads_path }`;
  const threads = get_value_safely({ file_path: threads_file_path, default_value: {} });
  const new_threads = { ...threads, ...data.threads };
  write_files_safely({
    file_path: threads_file_path,
    contents: JSON.stringify( new_threads, null, 2 ),
  });
}

function save_state ({ config, state }) {
  log.debug(`save_state():`, state);
  const did_exist = write_files_safely({
    file_path: config.state_path,
    contents: JSON.stringify( state, null, 2 )
  });
}

function ensure_dir_exists ({ dir_path }) {
  log.debug(`ensure_dir_exists()`);
  try {
    can_access_path_correctly({ path: dir_path });
  } catch ( error ) {

    if ( error.code === `ENOENT` ) {
      log.debug(`Creating ${ dir_path }`);
      fs.mkdirSync( dir_path, { recursive: true });
      log.debug(`Created ${ dir_path }`);
    } else {
       throw( error )
    }

  }  // ends try
}

function get_value_safely ({ file_path, default_value }) {
  log.debug(`get_value_safely()`);
  try {
    return JSON.parse( fs.readFileSync( file_path ));
  } catch ( error ) {
    // We don't care about files that don't exist
    if ( error.code !== `ENOENT` ) {
      log.debug(`JSON parse messages file error:`, error);
    }
    return default_value;
  }
}

function write_files_safely ({ file_path, contents }) {
  log.debug(`write_files_safely()`);
  try {
    can_access_path_correctly({ path: file_path });
    fs.writeFileSync(file_path, contents);
  } catch ( error ) {

    if ( error.code === `ENOENT` ) {
      log.debug(`Creating ${ file_path }`);
      fs.writeFileSync(file_path, contents);
      log.debug(`Created ${ file_path }`);
    } else {
       throw( error );
    }

  }  // ends try
}

function can_access_path_correctly ({ path }) {
  try {

    log.debug(`can_access_path_correctly()`);
    fs.accessSync( path );
    log.debug(`The ${ path } path exists`);
    fs.accessSync( path, fs.constants.W_OK );
    log.debug(`You can write to ${ path }`);
    return true;

  } catch ( error ) {

    if ( error.code === `ENOENT` ) {
      log.debug(`${ path } is missing`);
    } else if ( error.code === `EACCES` ) {
      log.debug(`You have no write permissions for ${ path }`);
    }
    throw( error );

  }  // ends try
}

const log = {
  debug: function () {
    if ( process.env.DEBUG ) {
      console.log( `Debug:`, ...arguments );
    }
  }
}


start();
