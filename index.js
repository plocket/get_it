const puppeteer = require(`puppeteer`);
const fs = require(`fs`);
require(`dotenv`).config();

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
  await wait_for_load({ page, seconds: 20 });

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
  // Go to workspace
  let [auth_reponse] = await Promise.all([
    page.waitForNavigation({ waitUntil: `domcontentloaded` }),
    page.click(`button[type="submit"]`),
  ]);
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
  // both negative makes math work. -1000 - -100 = -900
  let goal = config.goal_distance - position;

  // These must be outside the `while` scope
  // Collect at least one round of messages, even at top
  let reached_goal = await reached_channel_goal({ page, position, goal });
  let final_round_done = false;

  while ( !final_round_done || !reached_goal ) {
    // Collect currently existing elements
    let messages = await get_message_container_data({ page });
    log.debug(`msgs html: `, messages.html[0]);
    log.debug(`reply_ids:`, messages.reply_ids);

    // Get thread data for current elements in the thread
    let threads = await collect_threads({
      page,
      ids: messages.reply_ids,
    });

    // // save messages and threads data as we go since
    // // we may not be able to collect a whole channel at once
    // save_data({
    //   config, state,
    //   data: { messages: messages.html, threads }
    // });

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
    position = await scroll({
      page, position, goal,
      distance: -1 * (config.viewport_height - 20)  // -1980
    });
  }
};

async function scroll ({ page, position, goal, distance }) {
  /** Returns new position int. `distance` is negative. */
  log.debug(`scroll():`);
  // Don't overshoot. Math justification:
  // goal = 10, position = 1, distance = 20, desired = 9
  // goal = 100, position = 1, distance = 20, desired = 20
  // min( 10 - 1, 20) = 9, min( 100 - 1, 20) = 20
  // Convert to correct sign...?

  // It's broken, though. Bug thoughts:
  // I think the problem might be around here or around the values
  // I pass in
  // goal: 3000, distance: 2000, position:
  // working desired start positions: -2000, -1971
  // broken desired start positions: -1, -1970

  console.log(`goal ${Math.abs(goal)}, pos ${Math.abs(position)}, diff ${Math.abs(goal) - Math.abs(position)}, dist ${Math.abs(distance)}`)
  let direction = Math.sign(distance);  // -1 for up, 1 for down
  distance = direction * Math.min(
    Math.abs(goal) - Math.abs(position),
    Math.abs(distance)
  )
  // Scroll
  let scroller_handle = await page.waitForSelector(`.p-workspace__primary_view_body .c-scrollbar__hider`);
  await scroller_handle.evaluate( (elem, { distance }) => {
    elem.scrollBy(0, distance);
  }, { distance });
  await wait_for_load({ page, seconds: .5 });
  // Move forward
  position += distance;
  log.debug(`scrolled distance: ${distance}, position: ${ position }`);
  return position;
}

async function reached_channel_goal ({ page, position, goal }) {
  log.debug(`reached_channel_goal()`);
  let reached = false;
  let top = await page.$(`h1.p-message_pane__foreword__title`);
  if ( top ) {
    log.debug(`--- at top ---`);
    reached = true;
  } else if ( goal !== `end` ) {
    reached = Math.abs(position) >= Math.abs(goal);
  }
  log.debug(`reached_channel_goal(): position: ${ position }, goal: ${ goal }, reached: ${reached}`);
  return reached;
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
  await wait_for_load({ page, seconds: 1 });
  return await page.waitForSelector(`div[data-qa="threads_flexpane"]`);
}

async function collect_thread ({ page, thread_handle }) {
  log.debug(`collect_thread()`);
  let threads = [];
  let reached_end = await reached_thread_end({ thread_handle })
  // Always collect at least once (some threads are at the
  // bottom from the start).
  let final_round_done = true;

  while ( final_round_done || !reached_end ) {
    let thread_contents = await get_thread_contents_and_scroll({ page, thread_handle });
    threads.push( thread_contents );
    // Check if need one final round after the last scroll
    reached_end = await reached_thread_end({ thread_handle });
    final_round_done = final_round_done && !reached_end;
  }
  return threads;
}

async function reached_thread_end ({ thread_handle }) {
  log.debug(`reached_thread_end()`);
  return true;
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
  // return reached;
}

async function get_thread_contents_and_scroll ({ page, thread_handle }) {
  log.debug(`get_thread_contents_and_scroll()`);
  let thread_contents = await thread_handle.evaluate((elem) => {
    let html = elem.outerHTML;
    // scroll (down this time) after getting current contents
    let scroller = elem.querySelector(`.c-scrollbar__hider`);
    scroller.scrollBy(0, scroller.clientHeight );
    return html
  });
  await wait_for_load({ page, seconds: 1 });
  return thread_contents;
}

async function close_thread ({ page, thread_handle }) {
  /** The width of the viewport is affected by opening a thread,
  *   scrolling the messages. Undo that */
  await thread_handle.evaluate((elem) => {
    elem.querySelector('button[data-qa="close_flexpane"]').click();
  });
  await wait_for_load({ page, seconds: 1 });
}

async function wait_for_load ({ page, seconds }) {
  /** Wait, but with a clear name. **/
  log.debug(`wait_for_load()`);
  await page.waitForTimeout( 1000 * seconds );
}

function save_data ({ config, state, data }) {
  /** `data` {obj} - .messages and .threads */
  log.debug(`save_data()`);

  // message groups html list path
  let messages_path = `data/${state.current_channel}/${config.messages_path}`;
  let messages = JSON.parse(fs.readFileSync(messages_path));
  messages.unshift(data.messages);
  log.debug(`save msgs:`, messages[0][0]);
  fs.writeFileSync(messages_path, JSON.stringify(messages));

  // threads' strings by id object path
  let threads_path = `data/${state.current_channel}/${config.threads_path}`;
  let threads = JSON.parse(fs.readFileSync(threads_path));
  threads = { ...threads, ...data.threads };
  log.debug( threads );
  fs.writeFileSync(threads_path, JSON.stringify(threads));
}

function save_state (key, value) {
  log.debug(`save_state() key: ${key}`);
}

const log = {
  debug: function () {
    if (process.env.DEBUG) {
      console.log( `Debug:`, ...arguments );
    }
  }
}


start();
