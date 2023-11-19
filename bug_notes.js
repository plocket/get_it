/*
My code is supposed to scrape Slack in the browser. Slack has
infinite scroll. The code is supposed to scroll up through
Slack messages, stopping to open threads and scrape them too.
I start at the bottom and go up. When I scrape, I have to get
to the starting position I previously stopped at. I have to do
that gradually because of the way Slack behaves.

When doing this, I have a bug and I can't find its source. It
seems to me like it must have something to do with scrolling -
an element that was just found on the page no longer appears to
be on the page.

It only happens when the desired start position for scraping is
at or below -1970. I think that's just chance - more to do with what's
on the Slack channel currently. Maybe it's broken no matter what,
though, and the channel would break somewhere above -1971 starting
position too.

The code parts I believe are relevant are below, though you can
look at the full script at index.js. The console output for
a working run and for a broken run are below the code.
*/

async function collect_channel({
  page, config, state
}) {
  /** Collect all data from the start to the the scroll distance.
  *
  * page {obj} - puppeteer page
  */
  log.debug(`collect_channel()`);

  // Bug: this might be causing the problem, though I don't know how
  await scroll_to_start({ page, state, config });

  let position = state.position;
  // both negative makes math work. -1000 - -100 = -900
  let goal = config.goal_distance - position;

  // These must be outside the `while` scope
  let reached_goal = await reached_channel_goal({ page, position, goal });
  // Collect at least two rounds of messages
  let first_round = true;
  let do_final = true;

  while ( first_round || do_final || !reached_goal ) {
    // Will have collected at least once for this channel
    // From now on, use position and goal to determine completion
    first_round = false;

    // Collect currently existing elements
    let messages = await get_message_container_data({ page });
    log.debug(`msgs html: `, messages.html[0]);
    log.debug(`reply_ids:`, messages.reply_ids);

    // Get thread data for current elements
    
    // Bug: An element with a reply id no longer exists when we go
    // to collect one of the threads.
    let threads = await collect_threads({
      page,
      ids: messages.reply_ids,
    });

    // More stuff... (when the bug happens, the code never gets below here)

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
  console.log(`goal ${Math.abs(goal)}, pos ${Math.abs(position)}, diff ${Math.abs(goal) - Math.abs(position)}, dist ${Math.abs(distance)}`)
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
  // Bug: It doesn't seem to matter how long this waits
  await wait_for_load({ page, seconds: 5 });
  // Move forward
  position += distance;
  log.debug(`scrolled distance: ${distance}, position: ${ position }`);
  return position;
}

async function collect_threads ({ page, ids }) {
  log.debug(`collect_threads()`);
  let threads = {};
  // Click on each thread
  for ( let id of ids ) {
    let thread_handle = await open_thread({ page, id });
    let data = await collect_thread({ page, thread_handle });
    threads[id] = data;
  }
  return threads;
}

async function open_thread ({ page, id }) {
  log.debug(`open_thread() id: ${ id }`);
  // Note: Can't use page.$() as querySelectorAll won't work with these
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
  // always collect at least twice. Work it out when de-duplicating.
  let first_round = true;
  let do_final = true;

  while ( first_round || do_final || !reached_end ) {
    first_round = false;

    let thread_contents = await get_thread_contents({ thread_handle });
    threads.push( thread_contents );
    await wait_for_load({ page, seconds: .2 });

    // Check if need one final round after the last scroll
    // De-duplicate later
    // Bug: Since I've disabled scrolling, escape infinite loop
    reached_end = true;
    do_final = do_final && !reached_end;
  }  // ends while need to collect thread
  return threads;
}

async function get_thread_contents ({ thread_handle }) {
  log.debug(`get_thread_contents()`);
  let thread_contents = await thread_handle.evaluate((elem) => {
    let html = elem.outerHTML;
    // No scrolling
    return html;
  });
  return thread_contents;
}


/*

config is: {
  "state_path": "state.json",
  "channels": ["clean-slate"],
  "messages_path": "messages.json",
  "threads_path": "threads.json",
  "viewport_height": 2000,
  "goal_distance": -3000
}

*/


/* Working:

Absolute values
| goal (desired start position) | actual start position | difference | distance |
|-------------------------------|-----------------------|------------|----------|
| 1971                          | 0                     | 1971       | 1980     |
| 2000                          | 0                     | 2000       | 1980     |

Terminal output:
Debug: start()
Debug: log_in()
Debug: wait_for_load()
Debug: wait_for_load()
Debug: go_to_channel()
Debug: collect_channel()
Debug: scroll_to_start()
Debug: reached_channel_goal()
Debug: reached_channel_goal(): position: 0, goal: -1971, reached: false
Debug: scroll():
goal 1971, pos 0, diff 1971, dist 1980
Debug: wait_for_load()
Debug: scrolled distance: -1971, position: -1971
Debug: reached_channel_goal()
Debug: reached_channel_goal(): position: -1971, goal: -1971, reached: true
Debug: reached_channel_goal()
Debug: reached_channel_goal(): position: -1971, goal: -1029, reached: true
Debug: get_message_container_data()
Debug: msgs html:  <
Debug: reply_ids: [ '1680822172.150719', '1686147516.207519', '1686681620.339679' ]
Debug: collect_threads()
Debug: open_thread() id: 1680822172.150719
Debug: wait_for_load()
Debug: collect_thread()
Debug: reached_thread_end()
Debug: get_thread_contents()
Debug: wait_for_load()
Debug: reached_thread_end()
Debug: open_thread() id: 1686147516.207519
Debug: wait_for_load()
Debug: collect_thread()
Debug: reached_thread_end()
Debug: get_thread_contents()
Debug: wait_for_load()
Debug: reached_thread_end()
Debug: open_thread() id: 1686681620.339679
Debug: wait_for_load()
Debug: collect_thread()
Debug: reached_thread_end()
Debug: get_thread_contents()
Debug: wait_for_load()
Debug: reached_thread_end()
Debug: scroll():
goal 1029, pos 1971, diff -942, dist 1980
Debug: wait_for_load()
Debug: scrolled distance: 942, position: -1029
Debug: reached_channel_goal()
Debug: reached_channel_goal(): position: -1029, goal: -1029, reached: true
Debug: save_state() key: position
*/

/* Bug

Absolute values:
| goal (desired start position) | actual start position | difference | distance |
|-------------------------------|-----------------------|------------|----------|
| 1                             | 0                     | 1          | 1980     |
| 1970                          | 0                     | 1970       | 1980     |

Note: the first threads are collected properly. I think it's
just chance that the first ones are in the DOM and the next one
isn't. Whatever scrolling happens to cause the bug, it just
doesn't scroll far enough to lose the first few.

Terminal output:
Debug: start()
Debug: log_in()
Debug: wait_for_load()
Debug: wait_for_load()
Debug: go_to_channel()
Debug: collect_channel()
Debug: scroll_to_start()
Debug: reached_channel_goal()
Debug: reached_channel_goal(): position: 0, goal: -1970, reached: false
Debug: scroll():
goal 1970, pos 0, diff 1970, dist 1980
Debug: wait_for_load()
Debug: scrolled distance: -1970, position: -1970
Debug: reached_channel_goal()
Debug: reached_channel_goal(): position: -1970, goal: -1970, reached: true
Debug: reached_channel_goal()
Debug: reached_channel_goal(): position: -1970, goal: -1030, reached: true
Debug: get_message_container_data()
Debug: msgs html:  <
Debug: reply_ids: [
  '1686147516.207519',
  '1686681620.339679',
  '1697653609.109909',
  '1699370080.879749',
  '1700269990.427839'
]
Debug: collect_threads()
Debug: open_thread() id: 1686147516.207519
Debug: wait_for_load()
Debug: collect_thread()
Debug: reached_thread_end()
Debug: get_thread_contents()
Debug: wait_for_load()
Debug: reached_thread_end()
Debug: open_thread() id: 1686681620.339679
node:internal/process/promises:288
            triggerUncaughtException(err, true /* fromPromise /);
            ^

Error [TypeError]: Cannot read properties of null (reading 'querySelector')
    at evaluate (evaluate at open_thread (/.../get_it/index.js:220:14), <anonymous>:2:9)
    at #evaluate (/.../get_it/node_modules/puppeteer-core/lib/cjs/puppeteer/cdp/ExecutionContext.js:229:55)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async ExecutionContext.evaluate (/.../get_it/node_modules/puppeteer-core/lib/cjs/puppeteer/cdp/ExecutionContext.js:126:16)
    at async IsolatedWorld.evaluate (/.../get_it/node_modules/puppeteer-core/lib/cjs/puppeteer/cdp/IsolatedWorld.js:128:16)
    at async CdpFrame.evaluate (/.../get_it/node_modules/puppeteer-core/lib/cjs/puppeteer/api/Frame.js:363:20)
    at async CdpPage.evaluate (/.../get_it/node_modules/puppeteer-core/lib/cjs/puppeteer/api/Page.js:744:20)
    at async open_thread (/.../get_it/index.js:220:3)
    at async collect_threads (/.../get_it/index.js:209:25)
    at async collect_channel (/.../get_it/index.js:98:19)
*/
