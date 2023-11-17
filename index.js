const puppeteer = require(`puppeteer`);
const fs = require(`fs`);
require(`dotenv`).config();

// const MSG_ITEMS_SELECTOR = `.c-message_list .c-virtual_list__item`;
// const msg_ids = Array.from(containers).map((item) => {return item.id});

let config = JSON.parse(fs.readFileSync(`./config.json`));
console.log(config)
let state = JSON.parse(fs.readFileSync(`./${ config.state_path }`));
console.log(state)

config.channels;
// message groups html list path
config.messages_path;
// threads' strings by id object path
config.threads_path;

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
  // Have to interact with the browser prompt manually for now
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

  // Make very tall viewport?
  await page.setViewport({ height: config.viewport_height, width: 1000 });
  await log_in({ page });
  // ms * s * m. Start with 20 seconds
  await page.waitForTimeout(1000 * 20);

  // for ( let channel_name of config.channels ) {
  //   if (!state.finished_channels.includes( channel_name )) {
      await go_to_channel({ page, channel_name: state.current_channel });
      await scroll ({ page, distance: state.position });
      await collect_channel({ page, config, state });
  //   }
  // }

  log.debug(1);

  // ms, s, m
  await page.waitForTimeout(1000 * 60 * 1);

  browser.close();
};

async function log_in({ page }) {
  log.debug(`log_in()`);

  await page.goto(`https://cfa.slack.com/`, { waitUntil: `domcontentloaded` });
  // Choose log in by email
  let [email_reponse] = await Promise.all([
    page.waitForNavigation({ waitUntil: `domcontentloaded` }),
    page.click(`input[type="submit"]`),
  ]);
  // Authenticate
  let response = await auth({ page });
  log.debug( response );
  // Wait a little longer for load
  await page.waitForTimeout(1000 * 5);

  return page;
};  // Ends log_in()

async function auth({ page }) {
  await page.type(`input#email`, process.env.EMAIL);
  await page.type(`input#password`, process.env.PASSWORD);
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

  // Collect everything on the page now
  const messages = `.c-message_list`

  const scroll_distance = config.viewport_height - 20;
  await scroll ({ page, distance: scroll_distance });

  await page.waitForTimeout(1000 * 5);

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

async function scroll ({ page, distance }) {
  let scroller_selector = `.c-message_list .c-scrollbar__hider`
  let scroll_handle = await page.waitForSelector(scroller_selector);
  // let scroll_handle = await page.$(scroller_selector);
  await scroll_handle.evaluate( (elem, {distance}) => {
    // document.querySelector(`.c-message_list .c-scrollbar__hider`).scrollBy(0, -980);
    elem.scrollBy(0, (-1 * distance));
  }, { distance });
  await page.waitForTimeout(1000 * 1);
}  // Ends collect_msgs()

const reached_goal = function ({ position, goal }) {
  let reached = (-1 * position) > (-1 * goal);
  log.debug(`reached_goal(): position: ${ position }, goal: ${ goal }, reached: ${reached}`);
  return reached;
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

const save_state = function (key, value) {
  log.debug(`save_state()`);
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