const puppeteer = require(`puppeteer`);
const fs = require(`fs`);
require(`dotenv`).config();

// TODO: Make `page` global?

// TODO: config is really args?
let config = JSON.parse(fs.readFileSync(`./config.json`));
let state = JSON.parse(fs.readFileSync(`./${ config.state_path }`));

async function start() {
  log.debug(`start()`);

  const browser = await puppeteer.launch({
    // Have to interact with the browser prompt manually
    headless: !process.env.DEBUG,
    devtools: process.env.DEBUG,
  });
  const page = await browser.newPage();

  // Make very big viewport?
  await page.setViewport({ height: config.viewport_height, width: 1000 });
  await log_in({ page });
  // TODO: Create folder for channel if it doesn't exist
  // TODO: loop through channels
  await go_to_channel({ page, channel_name: state.current_channel });
  await collect_channel({ page, config, state });

  browser.close();
};

async function log_in({ page }) {
  log.debug(`log_in()`);
  await page.goto(process.env.WORKSPACE, { waitUntil: `domcontentloaded` });
  // Choose to log in by email
  let [email_reponse] = await Promise.all([
    page.waitForNavigation({ waitUntil: `domcontentloaded` }),
    page.click(`input[type="submit"]`),
  ]);
  // Log in
  let response = await auth({ page });
  await wait_for_load({ page, seconds: .5 });
  return page;
};  // Ends log_in()

async function auth({ page }) {
  await page.type(`input#email`, process.env.EMAIL);
  await page.type(`input#password`, process.env.PASSWORD);
  // Submit and go to workspace
  let [auth_reponse] = await Promise.all([
    page.waitForNavigation({ waitUntil: `domcontentloaded` }),
    page.click(`button[type="submit"]`),
  ]);
  await wait_for_load({ page, seconds: 20 });
  return auth_reponse;
}

async function go_to_channel({ page, channel_name }) {
  /** Click on channel link */
  log.debug(`go_to_channel()`);
  await page.click(`span[data-qa="channel_sidebar_name_${ channel_name }"]`);
};

async function collect_channel({
  page, config, state
}) {
  /** Collect all data from the start to the the scroll distance.
  *
  * page {obj} - puppeteer page
  */
  log.debug(`collect_channel()`);
  await scroll_to_start({ page, state, config });

  let position = state.position;
  let goal = position + config.travel_distance;
  // In case travel_distance is `end` or something (to inifitely scroll to the top)
  if ( typeof config.travel_distance === `string` ) {
    goal = config.travel_distance;
  }

  // These must be outside the `while` scope
  // Collect at least one round of messages, even at top
  let reached_goal = await reached_channel_goal({ page, position, goal });
  let final_round_done = false;

  while ( !final_round_done ) {
    // Collect currently existing elements
    let messages = await get_message_container_data({ page });
    log.debug(`msgs html: `, messages.html[0]);
    log.debug(`reply_ids:`, messages.reply_ids);

    // Get thread data for current elements in the thread
    let threads = await collect_threads({
      page,
      ids: messages.reply_ids,
    });

    // save one screen of messages and threads data as we go since
    // we may not be able to collect a whole channel at once
    // because of errors or computers going to sleep
    save_data({
      config, state,
      data: { messages: messages.html, threads }
    });

    // prepare for next loop
    // scroll to new position
    position = await scroll({
      page, position, goal,
      distance: -1 * (config.viewport_height - 20)  // -1980
    });

    // Check if need final round after the last scroll
    reached_goal = await reached_channel_goal({ page, position, goal });
    final_round_done = final_round_done || reached_goal;

    // save new start for next run of script
    save_state(`position`, position);
  }  // ends while need to collect
};  // Ends collect_channel()


async function scroll_to_start ({ page, state, config }) {
  log.debug(`scroll_to_start()`);
  // Sometimes page refuses to go a long distance in one go
  let position = 0;
  let goal = state.position;
  while ( !await reached_channel_goal({ page, position, goal }) ) {
    let distance = calculate_scroll_distance({
      position, goal,
      max_distance: -1 * (config.viewport_height - 20)  // TODO: Change to actual height, remove config
    });
    // TODO: scroller_selector
    position = await scroll({
      page, position, distance,
      scroller_selector: `.p-workspace__primary_view_body .c-scrollbar__hider`
    });
  }
};

async function scroll ({ page, position, distance, scroller_selector }) {
  /** Returns new position int */
  log.debug(`scroll()`);
  scroller_selector = scroller_selector || `.p-workspace__primary_view_body .c-scrollbar__hider`;
  scroller_handle = await page.waitForSelector(scroller_selector);
  await scroller_handle.evaluate( (elem, { distance }) => {
    elem.scrollBy(0, distance);
  }, { distance });
  await wait_for_movement({ page, seconds: .5 });
  // Move forward
  position += distance;
  log.debug(`scrolled: distance ${ distance }, position ${ position }`);
  return position;
}

function calculate_scroll_distance({ position, goal, max_distance }) {
  log.debug(`calculate_scroll_distance() absolutes: goal ${Math.abs(goal)}, pos ${Math.abs(position)}, diff ${Math.abs(goal) - Math.abs(position)}, dist ${Math.abs(distance)}`);
  // Don't overshoot. Math justification:
  // goal = 10, position = 1, distance = 20, desired = 9
  // goal = 100, position = 1, distance = 20, desired = 20
  // min( 10 - 1, 20) = 9, min( 100 - 1, 20) = 20
  // Convert to correct sign...?
  let direction = Math.sign(max_distance);  // -1 for up, 1 for down
  let distance_to_goal = Math.abs(goal) - Math.abs(position);
  let max_distance_to_travel = Math.abs(max_distance);
  let actual_distance = direction * Math.min(
        distance_to_goal, max_distance_to_travel
  );
  log.debug(`actual distance ${ actual_distance }`);
  return actual_distance;
}

async function reached_channel_goal ({ page, position, goal }) {
  log.debug(`reached_channel_goal()`);
  let reached_end = false;
  let top = await page.$(`h1.p-message_pane__foreword__title`);
  if ( top ) {
    log.debug(`--- at top ---`);
    reached_end = true;
  } else if ( [ `end`, `top`, `infinite`, `all` ].includes( goal ) ) {
    // Those strings means the dev wants to get all the way to the top.
    // Return false since we're not at the top.
    reached_end = false;
  } else {
    reached_end = Math.abs(position) >= Math.abs(goal);
  }
  log.debug(`reached_channel_goal(): position: ${ position }, goal: ${ goal }, reached_end: ${reached_end}`);
  return reached_end;
}

async function get_message_container_data ({ page }) {
  log.debug(`get_message_container_data()`);
  let handle = await page.waitForSelector(`.p-workspace__primary_view_body`);
  let data = await handle.evaluate((elem) => {
    let messages = document.querySelectorAll(`.p-workspace__primary_view_body .c-virtual_list__item:has(.c-message__reply_count)`);
    // DOM id of the messages with replies (and therefore threads)
    let reply_ids = Array.from(messages).map((item) => {return item.id});
    return {
      html: elem.outerHTML,
      reply_ids,
    }
  });
  return data;
}

async function collect_threads ({ page, ids }) {
  log.debug(`collect_threads()`);
  let threads = {};
  // Click on each thread
  for ( let id of ids ) {
    let thread_handle = await open_thread({ page, id });
    let data = await collect_thread({ page, thread_handle });
    await close_thread({ page, thread_handle });
    threads[id] = data;
  }
  return threads;
}

async function open_thread ({ page, id }) {
  log.debug(`open_thread() id: ${ id }`);
  // Note: page.$() as querySelectorAll won't work with these
  // ids (Example id: 1668547054.805359).
  await page.evaluate((id) => {
    let elem = document.getElementById(id);
    elem.querySelector('.c-message__reply_count').click();
  }, id);
  await wait_for_movement({ page, seconds: 2 });
  return await page.waitForSelector(`div[data-qa="threads_flexpane"]`);
}

async function collect_thread ({ page, thread_handle }) {
  log.debug(`collect_thread()`);
  let thread_items = [];
  let reached_end = await reached_thread_end({ thread_handle })
  // Always collect at least once (some threads are at the
  // bottom from the start).
  let final_round_done = false;

  while ( !final_round_done ) {
    let thread_contents = await get_thread_contents_and_scroll({ page, thread_handle });
    thread_items.push( thread_contents );
    // Check if need one final round after the last scroll
    reached_end = await reached_thread_end({ thread_handle });
    final_round_done = final_round_done || reached_end;
  }
  return thread_items;
}

// BUG: THREADS ALSO START AT THE BOTTOM
async function reached_thread_end ({ thread_handle }) {
  log.debug(`reached_thread_end()`);
  let reached = await thread_handle.evaluate((thread) => {
    // This is from examining the DOM. Very fragile to updates.

    // Get "reply" input top. The last thread element + some math
    // will be able to match input_top
    let input = thread.querySelector(`div[data-item-key="input"]`);
    let input_top = parseInt(window.getComputedStyle(input).getPropertyValue('top').replace('px', ''));
    
    // Get all thread items
    let items = Array.from(thread.querySelectorAll(`.c-virtual_list__item`));
    // For each thread item, check if its top matches the calculation
    for ( let item of items ) {
      let item_bottom = item.clientHeight + parseInt(window.getComputedStyle(item).getPropertyValue('top').replace('px', ''))
      if ( item_bottom === input_top ) {
        return true;
      }
    }
    return false;
  });
  return reached;
}

async function get_thread_contents_and_scroll ({ page, thread_handle }) {
  log.debug(`get_thread_contents_and_scroll()`);
  let thread_contents = await thread_handle.evaluate((elem) => {
    let html = `` + elem.outerHTML;
    // scroll (down this time) after getting current contents
    let scroller = elem.querySelector(`.c-scrollbar__hider`);
    scroller.scrollBy(0, scroller.clientHeight );
    return html
  });
  await wait_for_movement({ page, seconds: 1 });
  return thread_contents;
}

async function close_thread ({ page, thread_handle }) {
  /** The width of the viewport is affected by opening a thread,
  *   scrolling the messages. Undo that. */
  await thread_handle.evaluate((elem) => {
    elem.querySelector('button[data-qa="close_flexpane"]').click();
  });
  await wait_for_movement({ page, seconds: 1 });
}

async function wait_for_movement ({ page, seconds }) {
  /** Wait, but with a clearer name. **/
  log.debug(`wait_for_movement()`);
  await wait_for_load({ page, seconds });
}

async function wait_for_load ({ page, seconds }) {
  /** Wait, but with a clearer name. **/
  log.debug(`wait_for_load()`);
  await page.waitForTimeout( 1000 * seconds );
}

function save_data ({ config, state, data }) {
  /** `data` {obj} - .messages and .threads */
  log.debug(`save_data()`);

  let folder_path = `data/${state.current_channel}`;
  ensure_dir_exists({ dir_path: folder_path })

  // List of message groups html
  let msgs_file_path = `${folder_path}/${config.messages_path}`;
  ensure_file_exists({ file_path: msgs_file_path, default_contents: `[]` });
  console.log(`------\n\n`, fs.readFileSync(msgs_file_path), `\n\n-----`);
  let messages = JSON.parse(fs.readFileSync(msgs_file_path)) || [];
  messages.unshift(data.messages);
  // log.debug(`save msgs:`, messages[0][0]);
  fs.writeFileSync(msgs_file_path, JSON.stringify(messages));

  // Object of threads' html by id
  let threads_file_path = `${folder_path}/${config.threads_path}`;
  ensure_file_exists({ file_path: threads_file_path, default_contents: `{}` });
  let threads = JSON.parse(fs.readFileSync(threads_file_path)) || {};
  threads = { ...threads, ...data.threads };
  // log.debug( threads );
  fs.writeFileSync(threads_file_path, JSON.stringify(threads));
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

function ensure_file_exists ({ file_path, default_contents }) {
  log.debug(`ensure_file_exists()`);
  try {
    can_access_path_correctly({ path: file_path });
  } catch ( error ) {

    if ( error.code === `ENOENT` ) {
      log.debug(`Creating ${ file_path }`);
      fs.writeFileSync(file_path, default_contents);
      log.debug(`Created ${ file_path }`);
    } else {
       throw( error )
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

  } catch ( error ) {

    if ( error.code === `ENOENT` ) {
      log.debug(`${ path } is missing`);
    } else if ( error.code === `EACCES` ) {
      log.debug(`You have no write permissions for ${ path }`);
    }
    throw( error );

  }  // ends try
}

function save_state (key, value) {
  log.debug(`save_state(): key "${ key }", value: ${ value }`);
}

const log = {
  debug: function () {
    if (process.env.DEBUG) {
      console.log( `Debug:`, ...arguments );
    }
  }
}


start();
