const puppeteer = require(`puppeteer`);
const fs = require(`fs`);
require(`dotenv`).config();

// const MSG_ITEMS_SELECTOR = `.c-message_list .c-virtual_list__item`;
// const msg_ids = Array.from(containers).map((item) => {return item.id});

let config = JSON.parse(fs.readFileSync(`./config.json`));
// console.log(config)
let state = JSON.parse(fs.readFileSync(`./${ config.state_path }`));
// console.log(state)


async function start() {
  log.debug(`start()`);

  const browser = await puppeteer.launch({
    // Have to interact with the browser prompt manually
    headless: false, //!process.env.DEBUG,
    devtools: process.env.DEBUG,
    // args: ['--disable-features=ServiceWorker'],
  });
  const page = await browser.newPage();

  // Ignore the below. Keypress doesn't work either.
  // Headless mode works fine, but headful mode will have
  // to interact with the browser prompt manually for now
  /*  
  await page.setBypassServiceWorker(true);
  await page.setRequestInterception(true);

  const client = await page.target().createCDPSession();
  await client.send("Network.enable");  // Must enable network.
  await client.send("Network.setBypassServiceWorker", { bypass: true });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    log.debug(`--------- req`);
    // log.debug(req);
    log.debug(req.resourceType());
    log.debug(req.url());
    // if (['script', 'fetch', 'xhr'].includes(req.resourceType())) {
    //   log.debug(req.url());
      // if (req.url().includes('service-worker')) {
      if (req.url().includes('service-worker')
          || req.url().includes('cookielaw.org')) {
        req.abort();
      } else {
        req.continue();
      }
    // } else {
    //   req.continue();
    // }
  });
  */

  // Make very big viewport?
  await page.setViewport({ height: config.viewport_height, width: 1000 });
  await log_in({ page });
  // ms * s * m. Wait for page to load
  await page.waitForTimeout(1000 * 20);

  // for ( let channel_name of config.channels ) {
  //   if (!state.finished_channels.includes( channel_name )) {
      await go_to_channel({ page, channel_name: state.current_channel });
      await collect_channel({ page, config, state });
  //   }
  // }

  // // ms * s * m
  // await page.waitForTimeout(1000 * 60 * 1);

  browser.close();
};

async function log_in({ page }) {
  log.debug(`log_in()`);
  await page.goto(`https://cfa.slack.com/`, { waitUntil: `domcontentloaded` });
  // Choose to log in by email
  let [email_reponse] = await Promise.all([
    page.waitForNavigation({ waitUntil: `domcontentloaded` }),
    page.click(`input[type="submit"]`),
  ]);
  // Log in
  let response = await auth({ page });
  // Wait a little longer for load
  await page.waitForTimeout(1000 * 5);
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

  // These must be outside the `while` scope
  let position = state.position;
  // both negative. -1000 - -100 = -900
  let goal = config.goal_distance - position;
  let starting = true;

  await scroll_to_start({ page, state, config });

  while ( !await reached_goal({ page, position, goal }) ) {

    // Collect currently existing elements
    let msgs_data = await get_message_container_data({ page });
    log.debug(msgs_data.html[0]);
    log.debug(`reply_ids:`, msgs_data.reply_ids);

    // let threads_by_id = await collect_threads({
    //   page,
    //   ids: msgs_data.reply_ids
    // });

    // save messages and threads data

    // await page.waitForTimeout(1000 * 60 * 3);
    // // elem = document.querySelector(`.c-message_list .c-scrollbar__hider`);
    // // elem.scrollBy(0, -300000);

    // prepare for next loop
    // scroll to new position
    position = await scroll({
      page, position, goal,
      distance: -1 * (config.viewport_height - 20)
    });

    // save new start for next time??
    save_state(`position`, position);
  }


  // await page.evaluate(async ({
  //   config, state, funcs
  // }) => {
    


  //   const goal = state.goal;
  //   let position = state.position;

  //   let scroller = document.querySelector();
  //   // scroll to start position
  //   scroller.scrollBy(0, -1 * position);

  //   let scroll_distance = config.viewport_height - 20; // messages section is shorter

  //   while ( !reached_goal({ position, goal }) ) {
  //     // scroll
  //     scroller.scrollBy(0, -1 * scroll_distance);

  //     // save messages elem

  //     // find threads for each msg (send msg id)

  //     // save threads elem with msg id

  //     // save state in file

  //     // prepare for next thing
  //     position -= scroll;
  //     // save new start?
  //     save_state(`position`, position);
  //   }

  // }, {
  //   page, config, state
  // });
};  // Ends collect_channel()


async function scroll_to_start ({ page, state, config }) {
  log.debug(`scroll_to_start()`);
  // Page refuses to do it in one go, just goes a bit at a time.
  let position = 0;
  let goal = state.position;
  while ( !await reached_goal({ page, position, goal }) ) {
    position = await scroll({
      page, position, goal,
      distance: -1 * (config.viewport_height - 20)
    });
  }
};

async function scroll ({ page, position, goal, distance }) {
  /** Returns new position int. distance is negative. */
  log.debug(`scroll():`, distance);
  // Don't overshoot
  // goal = 10, position = 1, distance = 20, desired = 9
  // goal = 100, position = 1, distance = 20, desired = 20
  // min( 10 - 1, 20) = 9, min( 100 - 1, 20) = 20
  // To negative...?
  let direction = Math.sign(distance);  // -1 for up, 1 for down
  distance = direction * Math.min(
    Math.abs(goal) - Math.abs(position),
    Math.abs(distance)
  )
  // Scroll
  let scroller_handle = await page.waitForSelector(`.c-message_list .c-scrollbar__hider`);
  await scroller_handle.evaluate( (elem, { distance }) => {
    elem.scrollBy(0, distance);
  }, { distance });
  // Wait for load?
  await page.waitForTimeout(1000 * .5);
  // Move forward
  position += distance;
  log.debug(`scrolled position: ${ position }`);
  return position;
}

async function reached_goal ({ page, position, goal }) {
  log.debug(`reached_goal()`);
  let reached = false;
  let top = await page.$(`h1.p-message_pane__foreword__title`);
  if ( top ) {
    log.debug(`--- at top ---`);
    reached = Boolean(top);
  } else {
    reached = Math.abs(position) >= Math.abs(goal);
  }
  log.debug(`reached_goal(): position: ${ position }, goal: ${ goal }, reached: ${reached}`);
  return reached;
}

async function get_message_container_data ({ page }) {
  log.debug(`get_message_container_data()`);
  let handle = await page.waitForSelector(`.c-message_list`);
  let data = await handle.evaluate( (elem) => {
    let messages = document.querySelectorAll(`.c-message_list .c-virtual_list__item:has(.c-message__reply_count)`);
    let reply_ids = Array.from(messages).map((item) => {return item.id});
    return {
      html: elem.outerHTML,
      reply_ids,
      // `#${id} .c-message__reply_count`).click()
    }
  });
  return data;
}

async function collect_msgs (doc) {
  log.debug(`collect_msgs()`);
  let msg_container = document.querySelector(`.c-message_list`);
}  // Ends collect_msgs()

async function collect_threads (doc) {
  log.debug(`collect_threads()`);
  let msg_elems = document.querySelectorAll(`.c-message_list .c-virtual_list__item`);
}

async function collect_thread (doc) {
  log.debug(`collect_thread()`);
  // probably have to scroll here too, just down instead of up
}

function save_data({ config, state, data }) {
  log.debug(`save_data()`);

  // message groups html list path
  let messages_path = `data/${state.current_channel}/${config.messages_path}`;
  let messages = JSON.parse(fs.readFileSync(messages_path));
  messages.unshift(data.html);
  fs.writeFileSync(messages_path, JSON.stringify(messages));

  // threads' strings by id object path
  let threads_path = `data/${state.current_channel}/${config.threads_path}`;
  let threads = JSON.parse(fs.readFileSync(threads_path));
  threads = { ...threads, ...data.threads };
  fs.writeFileSync(threads_path, JSON.stringify(threads));
}

function save_state (key, value) {
  log.debug(`save_state() key: ${key}`);
}

const log = {
  debug: function (msg) {
    if (process.env.DEBUG) {
      console.log( `Debug:`, msg );
    }
  }
}



start();


/*
- save message element html `.c-message_list`
- save all ids in there forever to match up to threads
containers = document.querySelectorAll('.c-message_list .c-virtual_list__item')
ids = Array.from(containers).map((item) => {return item.id})
- ~~save "visible" ids~~
- detect "reply" element
- for each "reply":
    - save id of source post
    - click
    - wait
    - collect (don't save id list)
- ~~until all known ids are gone~~
- Scroll for ` (-1 * window.innerHeight) + 50 ` (it's a bit taller than the viewport)
```
scroller = document.querySelector('.c-message_list .c-scrollbar__hider')
scroller.scrollBy(0, -100)
```
- ~~scroll up by 25 (less than half shortest item?)? Scroll above last element and then up by 25 at a time?~~
    - increment scroll counter in config file
    - wait a while (1 second? that will take a lot of seconds. .25?)
    - ~~check id list~~
- ~~until all previous ids are gone~~
- repeat
- infinite scroll: reach top (how do we know? scroll 100 times and no new ids?)
- limited scroll: if >= top, stop
*/