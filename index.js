const puppeteer = require(`puppeteer`);
const fs = require(`fs`);
require(`dotenv`).config();

// TODO: scroll to find channel

/*
TODO: download files

Second thoughts:
WARNING!: When there are only a few files, there's no "show more" button
https://app.slack.com/client/T024F66L9/search
collect: <div aria-setsize="-1" class="c-virtual_list__item" tabindex="0" role="listitem" id="files_42fedab0-2578-4287-897e-40c1428a4256" data-qa="virtual-list-item" data-item-key="files_42fedab0-2578-4287-897e-40c1428a4256" style="top: 45px;"><div class="c-pillow_file_container p-search_file p-search_file--file-entity p-search_file--ia4 p-search_file--first" data-qa="search_result_file" role="group" aria-label="different_kind_of_tags_maybe.png undefined"><div class="c-pillow_file c-pillow_file--clickable c-pillow_file--view" data-qa="message_file_link"><div class="c-file_entity"><div class="c-file_entity__medium_base_entity c-base_entity c-base_entity--medium c-base_entity--has-avatar c-base_entity--vertically-center" data-id="F031GNUHNQY" data-sk="medium_file_entity"><div class="p-file_thumbnail__container p-file_thumbnail__container--image c-file_entity_thumbnail_icon c-base_entity__avatar c-file_entity_thumbnail_icon--img-border" aria-hidden="false" style="width: 36px; height: 36px;"><div class="p-file_thumbnail__tiny_thumb_wrapper" style="height: 36px; width: 36px;"><img class="p-file_thumbnail__image p-file_thumbnail__img" alt="different_kind_of_tags_maybe.png" src="https://files.slack.com/files-tmb/T024F66L9-F031GNUHNQY-5afdfe8048/different_kind_of_tags_maybe_80.png" height="36" width="36" data-qa="file_thumbnail_img"></div></div><div class="c-base_entity__text-contents"><span class="c-file_entity__text c-file_entity__text--first-line c-file_entity__text--first-line__flex c-base_entity__text" data-qa="file-entity-metadata-title"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span data-qa="file_name">different_kind_of_tags_maybe.png</span></span></span><div class="c-file_entity-user-timestamp" data-qa="file-entity-metadata-description"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span class="c-file_entity-user-timestamp c-file-entity-bold-description c-base_entity__text"><span class="c-truncate c-truncate--break_words" style="--lines: 1;"><span class="c-file_entity-user-timestamp__user-channel-files" data-qa="file-entity-metadata-user">Shared by MichelleB (she, Boston)</span>&nbsp;<span class="c-file_entity-user-timestamp__timestamp" data-qa="file-entity-metadata-timestamp">on Jan 29th, 2022</span></span></span></span></div></div></div></div></div><div class="c-file__actions c-message_actions__container c-message_actions__group" aria-label="different_kind_of_tags_maybe.png: More actions" data-qa="file_actions"><a target="_blank" class="c-link c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Download different_kind_of_tags_maybe.png" data-qa="download_action" delay="60" data-sk="tooltip_parent" href="https://files.slack.com/files-pri/T024F66L9-F031GNUHNQY/download/different_kind_of_tags_maybe.png?origin_team=T024F66L9" rel="noopener noreferrer"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M11.75 4a3.752 3.752 0 0 0-3.512 2.432.75.75 0 0 1-.941.447 2.5 2.5 0 0 0-2.937 3.664.75.75 0 0 1-.384 1.093A2.251 2.251 0 0 0 4.75 16h9.5a3.25 3.25 0 0 0 1.44-6.164.75.75 0 0 1-.379-.908A3.75 3.75 0 0 0 11.75 4ZM7.108 5.296a5.25 5.25 0 0 1 9.786 3.508A4.75 4.75 0 0 1 14.25 17.5h-9.5a3.75 3.75 0 0 1-2.02-6.91 4 4 0 0 1 4.378-5.294ZM10.25 7.5a.75.75 0 0 1 .75.75v3.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V8.25a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path></svg></a><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Share different_kind_of_tags_maybe.png" data-qa="share_file" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10.457 2.56a.75.75 0 0 1 .814.15l7 6.75a.75.75 0 0 1 0 1.08l-7 6.75A.75.75 0 0 1 10 16.75V13.5H6c-1.352 0-2.05.389-2.43.832-.4.465-.57 1.133-.57 1.918a.75.75 0 0 1-1.5 0V14c0-2.594.582-4.54 2-5.809C4.898 6.941 6.944 6.5 9.5 6.5h.5V3.25c0-.3.18-.573.457-.69ZM3.052 12.79C3.777 12.278 4.753 12 6 12h4.75a.75.75 0 0 1 .75.75v2.235L16.67 10 11.5 5.015V7.25a.75.75 0 0 1-.75.75H9.5c-2.444 0-4.023.434-5 1.309-.784.702-1.29 1.788-1.448 3.481Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="different_kind_of_tags_maybe.png: More actions" aria-haspopup="menu" data-qa="more_file_actions" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0Z" clip-rule="evenodd"></path></svg></button></div></div></div>
click? use url? does use correct filename, but we may want to keep the url to match the channel html? <a target="_blank" class="c-link c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Download different_kind_of_tags_maybe.png" data-qa="download_action" delay="60" data-sk="tooltip_parent" href="https://files.slack.com/files-pri/T024F66L9-F031GNUHNQY/download/different_kind_of_tags_maybe.png?origin_team=T024F66L9" rel="noopener noreferrer"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M11.75 4a3.752 3.752 0 0 0-3.512 2.432.75.75 0 0 1-.941.447 2.5 2.5 0 0 0-2.937 3.664.75.75 0 0 1-.384 1.093A2.251 2.251 0 0 0 4.75 16h9.5a3.25 3.25 0 0 0 1.44-6.164.75.75 0 0 1-.379-.908A3.75 3.75 0 0 0 11.75 4ZM7.108 5.296a5.25 5.25 0 0 1 9.786 3.508A4.75 4.75 0 0 1 14.25 17.5h-9.5a3.75 3.75 0 0 1-2.02-6.91 4 4 0 0 1 4.378-5.294ZM10.25 7.5a.75.75 0 0 1 .75.75v3.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V8.25a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path></svg></a>
downloads file to... somewhere in the channel folder
I think the files are all unique
How will scrolling need to work here?
  Answer: 20 files per page, with infinity scrolling, then paginated
  Scroller: <div data-qa="slack_kit_scrollbar" role="presentation" class="c-scrollbar__hider"><div role="presentation" class="c-scrollbar__child" style="width: 1123px;"><div data-qa="slack_kit_list" class="c-virtual_list__scroll_container c-search__results_container--virtualized c-search__results_container--centered" role="list" aria-label="Files" style="position: relative; height: 1302px;"><div aria-setsize="-1" class="c-virtual_list__item" tabindex="-1" role="listitem" id="search-filters" data-qa="virtual-list-item" data-item-key="search-filters" style="top: 0px;"><div class="c-search__filters_container c-search__filters_container--margin_bottom"><div role="toolbar" aria-orientation="horizontal" aria-label="Filter by" class="p_search_filter__block_container p_search_filter__block_container--ia4" data-qa="search_filters"><div class="p-search_filter__block_item_wrapper p-search_filter__block_item_wrapper--ia4" id="filter-from-button"><button class="c-button c-button--outline c-button--small p-explorer_controls__button p-search_filter__block_item p-search_filter__block_item--withCaret p-search_filter__block_item--noTruncation" tabindex="0" id="filter-from" data-qa="search-filters-from-filter_trigger" aria-expanded="false" type="button"><div class="c-filter-pill__content"><span class="p-search_filter__block_label_wrapper p-search_filter__block_label_wrapper--string">From</span><div class="p-search_filter__block_item_dropdown_icon "><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class="" style="--s: 16px;"><path fill="currentColor" fill-rule="evenodd" d="M5.72 7.47a.75.75 0 0 1 1.06 0L10 10.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 8.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg></div></div></button><span id="filter-from-label" class="offscreen">People filter:</span></div><div class="p-search_filter__block_item_wrapper p-search_filter__block_item_wrapper--ia4" id="filter-in-button"><button class="c-button c-button--outline c-button--small c-filter-pill--active p-explorer_controls__button p-explorer_controls__button--active p-search_filter__block_item p-search_filter__block_item--withCaret p-search_filter__block_item--noTruncation" tabindex="-1" id="filter-in" data-qa="search-filters-in-filter_trigger" aria-labelledby="filter-in-label filter-in" aria-expanded="false" type="button"><div class="c-filter-pill__content"><span class="p-search_filter__block_label_wrapper">In&nbsp;<span class="c-inline_channel_entity c-base_inline_entity c-base_inline_entity--has_avatar c-base_inline_entity--truncate_block" data-qa="inline_channel_entity" data-channel-id="CK92JC0JH"><span><span class="c-truncate c-truncate--break_words" style="--lines: 1;"><span class="c-base_inline_entity__avatar c-inline_channel_icon c-inline_channel_icon--space" data-inline-channel-type-icon="channel"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class="is-inline"><path fill="currentColor" fill-rule="evenodd" d="M9.74 3.878a.75.75 0 1 0-1.48-.255L7.68 7H3.75a.75.75 0 0 0 0 1.5h3.67L6.472 14H2.75a.75.75 0 0 0 0 1.5h3.463l-.452 2.623a.75.75 0 0 0 1.478.255l.496-2.878h3.228l-.452 2.623a.75.75 0 0 0 1.478.255l.496-2.878h3.765a.75.75 0 0 0 0-1.5h-3.506l.948-5.5h3.558a.75.75 0 0 0 0-1.5h-3.3l.54-3.122a.75.75 0 0 0-1.48-.255L12.43 7H9.2l.538-3.122ZM11.221 14l.948-5.5H8.942L7.994 14h3.228Z" clip-rule="evenodd"></path></svg></span><span class="c-base_inline_entity__primary_content"><span class="c-inline_channel_entity__content"><span class="c-channel_entity__name" data-qa="inline_channel_entity__name">clean-slate</span></span></span></span></span></span></span><div class="p-search_filter__block_item_dropdown_icon "><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class="" style="--s: 16px;"><path fill="currentColor" fill-rule="evenodd" d="M5.72 7.47a.75.75 0 0 1 1.06 0L10 10.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 8.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg></div></div></button><span id="filter-in-label" class="offscreen">Channels and direct messages filter:</span></div><div class="p-search_filter__block_item_wrapper p-search_filter__block_item_wrapper--ia4" id="filter-file-type-button"><button class="c-button c-button--outline c-button--small p-explorer_controls__button p-search_filter__block_item p-search_filter__block_item--withCaret p-search_filter__block_item--noTruncation" tabindex="-1" id="filter-file-type" data-qa="search-filters-file-type-filter_trigger" aria-expanded="false" type="button"><div class="c-filter-pill__content"><span class="p-search_filter__block_label_wrapper p-search_filter__block_label_wrapper--string">File type</span><div class="p-search_filter__block_item_dropdown_icon "><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class="" style="--s: 16px;"><path fill="currentColor" fill-rule="evenodd" d="M5.72 7.47a.75.75 0 0 1 1.06 0L10 10.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 8.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg></div></div></button><span id="filter-file-type-label" class="offscreen">File type filter:</span></div><div class="p-search_filter__block_item_wrapper p-search_filter__block_item_wrapper--ia4" id="filter-date-button"><button class="c-button c-button--outline c-button--small p-explorer_controls__button p-search_filter__block_item p-search_filter__block_item--withCaret p-search_filter__block_item--noTruncation" tabindex="-1" id="filter-date" data-qa="search-filters-date-filter_trigger" aria-expanded="false" aria-haspopup="menu" type="button"><div class="c-filter-pill__content"><span class="p-search_filter__block_label_wrapper p-search_filter__block_label_wrapper--string">Date</span><div class="p-search_filter__block_item_dropdown_icon "><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class="" style="--s: 16px;"><path fill="currentColor" fill-rule="evenodd" d="M5.72 7.47a.75.75 0 0 1 1.06 0L10 10.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 8.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg></div></div></button><span id="filter-date-label" class="offscreen">Date filter:</span></div><div class="p-search_filter__block_item_wrapper p-search_filter__block_item_wrapper--ia4"><button class="c-button-unstyled p-search_filter__modal_trigger--ia4" type="button" tabindex="-1"><span class="p-search_filter__filters_link_icon"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class="is-inline" style="--s: 18px;"><path fill="currentColor" fill-rule="evenodd" d="M3.75 5.5a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75ZM5 10.25a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75Zm2 4a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd"></path></svg></span>Filters </button></div></div><button class="c-button-unstyled p-explorer_controls__button" data-qa="file_sort_toggle" aria-expanded="false" type="button"><span>Most relevant</span><i class="c-icon p-search_filter_chevron_icon c-icon--chevron-down c-icon--inline" type="chevron-down" aria-hidden="true"></i></button><div class="p-browse_page_controls__toggle_channel_files c-search__filters__toggle"><div class="p-browse_page_controls__toggle_background"></div><div class="p-browse_page_controls__toggle_button_background--left"></div><button class="c-button-unstyled c-icon_button c-icon_button--size_small p-browse_page_controls__toggle_button p-browse_page_controls__toggle_button--selected c-icon_button--default" data-qa="page_controls_toggle_button_list" aria-label="View as list" delay="150" data-sk="tooltip_parent" type="button"><i class="c-icon c-icon--grabby-patty" type="grabby-patty" aria-hidden="true"></i></button><button class="c-button-unstyled c-icon_button c-icon_button--size_small p-browse_page_controls__toggle_button c-icon_button--default" data-qa="page_controls_toggle_button_grid" aria-label="View as grid" delay="150" data-sk="tooltip_parent" type="button"><i class="c-icon c-icon--gn-menu" type="gn-menu" aria-hidden="true"></i></button></div></div></div><div aria-setsize="-1" class="c-virtual_list__item" tabindex="-1" role="listitem" id="search-aux" data-qa="virtual-list-item" data-item-key="search-aux" style="top: 45px;"></div><div aria-setsize="-1" class="c-virtual_list__item" tabindex="0" role="listitem" id="files_b110b8d9-8a66-4963-999c-8206b0c5573b" data-qa="virtual-list-item" data-item-key="files_b110b8d9-8a66-4963-999c-8206b0c5573b" style="top: 45px;"><div class="c-pillow_file_container p-search_file p-search_file--file-entity p-search_file--ia4 p-search_file--first" data-qa="search_result_file" role="group" aria-label="Exporting Data and Managing Your Profile: Discourse &amp;amp; Slack undefined"><div class="c-pillow_file c-pillow_file--clickable" data-qa="message_file_link"><div class="c-file_entity"><div class="c-file_entity__medium_base_entity c-base_entity c-base_entity--medium c-base_entity--has-avatar c-base_entity--vertically-center" data-id="F05BXKT6GBZ" data-sk="medium_file_entity"><div class="p-file_thumbnail__container p-file_thumbnail__container--other c-file_entity_thumbnail_icon c-base_entity__avatar" aria-hidden="false" style="width: 36px; height: 36px;"><i class="c-icon c-icon__file p-file_thumbnail__file_icon c-icon--file-google-document c-icon--file-google-document-svgicon c-icon--filetype-svgicon" data-qa="file_thumbnail_icon" type="gdoc" aria-hidden="true"></i></div><div class="c-base_entity__text-contents"><span class="c-file_entity__text c-file_entity__text--first-line c-file_entity__text--first-line__flex c-base_entity__text" data-qa="file-entity-metadata-title"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span data-qa="file_name">Exporting Data and Managing Your Profile: Discourse &amp; Slack</span></span></span><div class="c-file_entity-user-timestamp" data-qa="file-entity-metadata-description"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span class="c-file_entity-user-timestamp c-file-entity-bold-description c-base_entity__text"><span class="c-truncate c-truncate--break_words" style="--lines: 1;"><span class="c-file_entity-user-timestamp__user-channel-files" data-qa="file-entity-metadata-user">Shared by Hashim</span>&nbsp;<span class="c-file_entity-user-timestamp__timestamp" data-qa="file-entity-metadata-timestamp">on Jun 13th</span></span></span></span></div></div></div></div></div><div class="c-file__actions c-message_actions__container c-message_actions__group" aria-label="Exporting Data and Managing Your Profile: Discourse &amp; Slack: More actions" data-qa="file_actions"><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Share Exporting Data and Managing Your Profile: Discourse &amp; Slack" data-qa="share_file" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10.457 2.56a.75.75 0 0 1 .814.15l7 6.75a.75.75 0 0 1 0 1.08l-7 6.75A.75.75 0 0 1 10 16.75V13.5H6c-1.352 0-2.05.389-2.43.832-.4.465-.57 1.133-.57 1.918a.75.75 0 0 1-1.5 0V14c0-2.594.582-4.54 2-5.809C4.898 6.941 6.944 6.5 9.5 6.5h.5V3.25c0-.3.18-.573.457-.69ZM3.052 12.79C3.777 12.278 4.753 12 6 12h4.75a.75.75 0 0 1 .75.75v2.235L16.67 10 11.5 5.015V7.25a.75.75 0 0 1-.75.75H9.5c-2.444 0-4.023.434-5 1.309-.784.702-1.29 1.788-1.448 3.481Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Exporting Data and Managing Your Profile: Discourse &amp; Slack: More actions" aria-haspopup="menu" data-qa="more_file_actions" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0Z" clip-rule="evenodd"></path></svg></button></div></div></div><div aria-setsize="-1" class="c-virtual_list__item" tabindex="-1" role="listitem" id="files_60b892f5-6c8e-4ac5-9963-ef378efae4d5" data-qa="virtual-list-item" data-item-key="files_60b892f5-6c8e-4ac5-9963-ef378efae4d5" style="top: 106px;"><div class="c-pillow_file_container p-search_file p-search_file--file-entity p-search_file--ia4" data-qa="search_result_file" role="group" aria-label="image.png undefined"><div class="c-pillow_file c-pillow_file--clickable c-pillow_file--view" data-qa="message_file_link"><div class="c-file_entity"><div class="c-file_entity__medium_base_entity c-base_entity c-base_entity--medium c-base_entity--has-avatar c-base_entity--vertically-center" data-id="F01AR5F2KN0" data-sk="medium_file_entity"><div class="p-file_thumbnail__container p-file_thumbnail__container--image c-file_entity_thumbnail_icon c-base_entity__avatar c-file_entity_thumbnail_icon--img-border" aria-hidden="false" style="width: 36px; height: 36px;"><div class="p-file_thumbnail__tiny_thumb_wrapper" style="height: 36px; width: 36px;"><img class="p-file_thumbnail__image p-file_thumbnail__img" alt="image.png" src="https://files.slack.com/files-tmb/T024F66L9-F01AR5F2KN0-c6f7601c5a/image_80.png" height="36" width="36" data-qa="file_thumbnail_img"></div></div><div class="c-base_entity__text-contents"><span class="c-file_entity__text c-file_entity__text--first-line c-file_entity__text--first-line__flex c-base_entity__text" data-qa="file-entity-metadata-title"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span data-qa="file_name">image.png</span></span></span><div class="c-file_entity-user-timestamp" data-qa="file-entity-metadata-description"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span class="c-file_entity-user-timestamp c-file-entity-bold-description c-base_entity__text"><span class="c-truncate c-truncate--break_words" style="--lines: 1;"><span class="c-file_entity-user-timestamp__user-channel-files" data-qa="file-entity-metadata-user">Shared by Matt Zagaja</span>&nbsp;<span class="c-file_entity-user-timestamp__timestamp" data-qa="file-entity-metadata-timestamp">on Sep 11th, 2020</span></span></span></span></div></div></div></div></div><div class="c-file__actions c-message_actions__container c-message_actions__group" aria-label="image.png: More actions" data-qa="file_actions"><a target="_blank" class="c-link c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Download image.png" data-qa="download_action" delay="60" data-sk="tooltip_parent" href="https://files.slack.com/files-pri/T024F66L9-F01AR5F2KN0/download/image.png?origin_team=T024F66L9" rel="noopener noreferrer"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M11.75 4a3.752 3.752 0 0 0-3.512 2.432.75.75 0 0 1-.941.447 2.5 2.5 0 0 0-2.937 3.664.75.75 0 0 1-.384 1.093A2.251 2.251 0 0 0 4.75 16h9.5a3.25 3.25 0 0 0 1.44-6.164.75.75 0 0 1-.379-.908A3.75 3.75 0 0 0 11.75 4ZM7.108 5.296a5.25 5.25 0 0 1 9.786 3.508A4.75 4.75 0 0 1 14.25 17.5h-9.5a3.75 3.75 0 0 1-2.02-6.91 4 4 0 0 1 4.378-5.294ZM10.25 7.5a.75.75 0 0 1 .75.75v3.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V8.25a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path></svg></a><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Share image.png" data-qa="share_file" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10.457 2.56a.75.75 0 0 1 .814.15l7 6.75a.75.75 0 0 1 0 1.08l-7 6.75A.75.75 0 0 1 10 16.75V13.5H6c-1.352 0-2.05.389-2.43.832-.4.465-.57 1.133-.57 1.918a.75.75 0 0 1-1.5 0V14c0-2.594.582-4.54 2-5.809C4.898 6.941 6.944 6.5 9.5 6.5h.5V3.25c0-.3.18-.573.457-.69ZM3.052 12.79C3.777 12.278 4.753 12 6 12h4.75a.75.75 0 0 1 .75.75v2.235L16.67 10 11.5 5.015V7.25a.75.75 0 0 1-.75.75H9.5c-2.444 0-4.023.434-5 1.309-.784.702-1.29 1.788-1.448 3.481Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="image.png: More actions" aria-haspopup="menu" data-qa="more_file_actions" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0Z" clip-rule="evenodd"></path></svg></button></div></div></div><div aria-setsize="-1" class="c-virtual_list__item" tabindex="-1" role="listitem" id="files_5117c5a7-35a9-493d-a2ff-1812c930c152" data-qa="virtual-list-item" data-item-key="files_5117c5a7-35a9-493d-a2ff-1812c930c152" style="top: 167px;"><div class="c-pillow_file_container p-search_file p-search_file--file-entity p-search_file--ia4" data-qa="search_result_file" role="group" aria-label="image.png undefined"><div class="c-pillow_file c-pillow_file--clickable c-pillow_file--view" data-qa="message_file_link"><div class="c-file_entity"><div class="c-file_entity__medium_base_entity c-base_entity c-base_entity--medium c-base_entity--has-avatar c-base_entity--vertically-center" data-id="F04CQCTC8FR" data-sk="medium_file_entity"><div class="p-file_thumbnail__container p-file_thumbnail__container--image c-file_entity_thumbnail_icon c-base_entity__avatar c-file_entity_thumbnail_icon--img-border" aria-hidden="false" style="width: 36px; height: 36px;"><div class="p-file_thumbnail__tiny_thumb_wrapper" style="height: 36px; width: 36px;"><img class="p-file_thumbnail__image p-file_thumbnail__img" alt="image.png" src="https://files.slack.com/files-tmb/T024F66L9-F04CQCTC8FR-39c7d8e6f9/image_80.png" height="36" width="36" data-qa="file_thumbnail_img"></div></div><div class="c-base_entity__text-contents"><span class="c-file_entity__text c-file_entity__text--first-line c-file_entity__text--first-line__flex c-base_entity__text" data-qa="file-entity-metadata-title"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span data-qa="file_name">image.png</span></span></span><div class="c-file_entity-user-timestamp" data-qa="file-entity-metadata-description"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span class="c-file_entity-user-timestamp c-file-entity-bold-description c-base_entity__text"><span class="c-truncate c-truncate--break_words" style="--lines: 1;"><span class="c-file_entity-user-timestamp__user-channel-files" data-qa="file-entity-metadata-user">Shared by Shaun</span>&nbsp;<span class="c-file_entity-user-timestamp__timestamp" data-qa="file-entity-metadata-timestamp">on Nov 30th, 2022</span></span></span></span></div></div></div></div></div><div class="c-file__actions c-message_actions__container c-message_actions__group" aria-label="image.png: More actions" data-qa="file_actions"><a target="_blank" class="c-link c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Download image.png" data-qa="download_action" delay="60" data-sk="tooltip_parent" href="https://files.slack.com/files-pri/T024F66L9-F04CQCTC8FR/download/image.png?origin_team=T024F66L9" rel="noopener noreferrer"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M11.75 4a3.752 3.752 0 0 0-3.512 2.432.75.75 0 0 1-.941.447 2.5 2.5 0 0 0-2.937 3.664.75.75 0 0 1-.384 1.093A2.251 2.251 0 0 0 4.75 16h9.5a3.25 3.25 0 0 0 1.44-6.164.75.75 0 0 1-.379-.908A3.75 3.75 0 0 0 11.75 4ZM7.108 5.296a5.25 5.25 0 0 1 9.786 3.508A4.75 4.75 0 0 1 14.25 17.5h-9.5a3.75 3.75 0 0 1-2.02-6.91 4 4 0 0 1 4.378-5.294ZM10.25 7.5a.75.75 0 0 1 .75.75v3.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V8.25a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path></svg></a><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Share image.png" data-qa="share_file" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10.457 2.56a.75.75 0 0 1 .814.15l7 6.75a.75.75 0 0 1 0 1.08l-7 6.75A.75.75 0 0 1 10 16.75V13.5H6c-1.352 0-2.05.389-2.43.832-.4.465-.57 1.133-.57 1.918a.75.75 0 0 1-1.5 0V14c0-2.594.582-4.54 2-5.809C4.898 6.941 6.944 6.5 9.5 6.5h.5V3.25c0-.3.18-.573.457-.69ZM3.052 12.79C3.777 12.278 4.753 12 6 12h4.75a.75.75 0 0 1 .75.75v2.235L16.67 10 11.5 5.015V7.25a.75.75 0 0 1-.75.75H9.5c-2.444 0-4.023.434-5 1.309-.784.702-1.29 1.788-1.448 3.481Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="image.png: More actions" aria-haspopup="menu" data-qa="more_file_actions" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0Z" clip-rule="evenodd"></path></svg></button></div></div></div><div aria-setsize="-1" class="c-virtual_list__item" tabindex="-1" role="listitem" id="files_fbe6d050-6291-4ea5-9e3b-e79398057214" data-qa="virtual-list-item" data-item-key="files_fbe6d050-6291-4ea5-9e3b-e79398057214" style="top: 228px;"><div class="c-pillow_file_container p-search_file p-search_file--file-entity p-search_file--ia4" data-qa="search_result_file" role="group" aria-label="Screenshot_20210904-151115_Facebook~2.jpg undefined"><div class="c-pillow_file c-pillow_file--clickable c-pillow_file--view" data-qa="message_file_link"><div class="c-file_entity"><div class="c-file_entity__medium_base_entity c-base_entity c-base_entity--medium c-base_entity--has-avatar c-base_entity--vertically-center" data-id="F02E4F72GBS" data-sk="medium_file_entity"><div class="p-file_thumbnail__container p-file_thumbnail__container--image c-file_entity_thumbnail_icon c-base_entity__avatar c-file_entity_thumbnail_icon--img-border" aria-hidden="false" style="width: 36px; height: 36px;"><div class="p-file_thumbnail__tiny_thumb_wrapper" style="height: 36px; width: 36px;"><img class="p-file_thumbnail__image p-file_thumbnail__img" alt="Screenshot_20210904-151115_Facebook~2.jpg" src="https://files.slack.com/files-tmb/T024F66L9-F02E4F72GBS-86d20978c3/screenshot_20210904-151115_facebook_2_80.jpg" height="36" width="36" data-qa="file_thumbnail_img"></div></div><div class="c-base_entity__text-contents"><span class="c-file_entity__text c-file_entity__text--first-line c-file_entity__text--first-line__flex c-base_entity__text" data-qa="file-entity-metadata-title"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span data-qa="file_name">Screenshot_20210904-151115_Facebook~2.jpg</span></span></span><div class="c-file_entity-user-timestamp" data-qa="file-entity-metadata-description"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span class="c-file_entity-user-timestamp c-file-entity-bold-description c-base_entity__text"><span class="c-truncate c-truncate--break_words" style="--lines: 1;"><span class="c-file_entity-user-timestamp__user-channel-files" data-qa="file-entity-metadata-user">Shared by Myranda (she/they)</span>&nbsp;<span class="c-file_entity-user-timestamp__timestamp" data-qa="file-entity-metadata-timestamp">on Sep 4th, 2021</span></span></span></span></div></div></div></div></div><div class="c-file__actions c-message_actions__container c-message_actions__group" aria-label="Screenshot_20210904-151115_Facebook~2.jpg: More actions" data-qa="file_actions"><a target="_blank" class="c-link c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Download Screenshot_20210904-151115_Facebook~2.jpg" data-qa="download_action" delay="60" data-sk="tooltip_parent" href="https://files.slack.com/files-pri/T024F66L9-F02E4F72GBS/download/screenshot_20210904-151115_facebook_2.jpg?origin_team=T024F66L9" rel="noopener noreferrer"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M11.75 4a3.752 3.752 0 0 0-3.512 2.432.75.75 0 0 1-.941.447 2.5 2.5 0 0 0-2.937 3.664.75.75 0 0 1-.384 1.093A2.251 2.251 0 0 0 4.75 16h9.5a3.25 3.25 0 0 0 1.44-6.164.75.75 0 0 1-.379-.908A3.75 3.75 0 0 0 11.75 4ZM7.108 5.296a5.25 5.25 0 0 1 9.786 3.508A4.75 4.75 0 0 1 14.25 17.5h-9.5a3.75 3.75 0 0 1-2.02-6.91 4 4 0 0 1 4.378-5.294ZM10.25 7.5a.75.75 0 0 1 .75.75v3.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V8.25a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path></svg></a><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Share Screenshot_20210904-151115_Facebook~2.jpg" data-qa="share_file" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10.457 2.56a.75.75 0 0 1 .814.15l7 6.75a.75.75 0 0 1 0 1.08l-7 6.75A.75.75 0 0 1 10 16.75V13.5H6c-1.352 0-2.05.389-2.43.832-.4.465-.57 1.133-.57 1.918a.75.75 0 0 1-1.5 0V14c0-2.594.582-4.54 2-5.809C4.898 6.941 6.944 6.5 9.5 6.5h.5V3.25c0-.3.18-.573.457-.69ZM3.052 12.79C3.777 12.278 4.753 12 6 12h4.75a.75.75 0 0 1 .75.75v2.235L16.67 10 11.5 5.015V7.25a.75.75 0 0 1-.75.75H9.5c-2.444 0-4.023.434-5 1.309-.784.702-1.29 1.788-1.448 3.481Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Screenshot_20210904-151115_Facebook~2.jpg: More actions" aria-haspopup="menu" data-qa="more_file_actions" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0Z" clip-rule="evenodd"></path></svg></button></div></div></div><div aria-setsize="-1" class="c-virtual_list__item" tabindex="-1" role="listitem" id="files_1dd970c4-c4bf-47e5-9bda-6566879ef048" data-qa="virtual-list-item" data-item-key="files_1dd970c4-c4bf-47e5-9bda-6566879ef048" style="top: 289px;"><div class="c-pillow_file_container p-search_file p-search_file--file-entity p-search_file--ia4" data-qa="search_result_file" role="group" aria-label="CfA Clean Slate States discussion undefined"><div class="c-pillow_file c-pillow_file--clickable" data-qa="message_file_link"><div class="c-file_entity"><div class="c-file_entity__medium_base_entity c-base_entity c-base_entity--medium c-base_entity--has-avatar c-base_entity--vertically-center" data-id="F03PT68P0SD" data-sk="medium_file_entity"><div class="p-file_thumbnail__container p-file_thumbnail__container--other c-file_entity_thumbnail_icon c-base_entity__avatar" aria-hidden="false" style="width: 36px; height: 36px;"><i class="c-icon c-icon__file p-file_thumbnail__file_icon c-icon--file-google-document c-icon--file-google-document-svgicon c-icon--filetype-svgicon" data-qa="file_thumbnail_icon" type="gdoc" aria-hidden="true"></i></div><div class="c-base_entity__text-contents"><span class="c-file_entity__text c-file_entity__text--first-line c-file_entity__text--first-line__flex c-base_entity__text" data-qa="file-entity-metadata-title"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span data-qa="file_name">CfA Clean Slate States discussion</span></span></span><div class="c-file_entity-user-timestamp" data-qa="file-entity-metadata-description"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span class="c-file_entity-user-timestamp c-file-entity-bold-description c-base_entity__text"><span class="c-truncate c-truncate--break_words" style="--lines: 1;"><span class="c-file_entity-user-timestamp__user-channel-files" data-qa="file-entity-metadata-user">Shared by Shaun</span>&nbsp;<span class="c-file_entity-user-timestamp__timestamp" data-qa="file-entity-metadata-timestamp">on Jul 13th, 2022</span></span></span></span></div></div></div></div></div><div class="c-file__actions c-message_actions__container c-message_actions__group" aria-label="CfA Clean Slate States discussion: More actions" data-qa="file_actions"><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Share CfA Clean Slate States discussion" data-qa="share_file" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10.457 2.56a.75.75 0 0 1 .814.15l7 6.75a.75.75 0 0 1 0 1.08l-7 6.75A.75.75 0 0 1 10 16.75V13.5H6c-1.352 0-2.05.389-2.43.832-.4.465-.57 1.133-.57 1.918a.75.75 0 0 1-1.5 0V14c0-2.594.582-4.54 2-5.809C4.898 6.941 6.944 6.5 9.5 6.5h.5V3.25c0-.3.18-.573.457-.69ZM3.052 12.79C3.777 12.278 4.753 12 6 12h4.75a.75.75 0 0 1 .75.75v2.235L16.67 10 11.5 5.015V7.25a.75.75 0 0 1-.75.75H9.5c-2.444 0-4.023.434-5 1.309-.784.702-1.29 1.788-1.448 3.481Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="CfA Clean Slate States discussion: More actions" aria-haspopup="menu" data-qa="more_file_actions" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0Z" clip-rule="evenodd"></path></svg></button></div></div></div><div aria-setsize="-1" class="c-virtual_list__item" tabindex="-1" role="listitem" id="files_96e2beac-0e08-4f66-a6c7-4809469710a8" data-qa="virtual-list-item" data-item-key="files_96e2beac-0e08-4f66-a6c7-4809469710a8" style="top: 350px;"><div class="c-pillow_file_container p-search_file p-search_file--file-entity p-search_file--ia4" data-qa="search_result_file" role="group" aria-label="Feb 5th Clean Slate notes undefined"><div class="c-pillow_file c-pillow_file--clickable" data-qa="message_file_link"><div class="c-file_entity"><div class="c-file_entity__medium_base_entity c-base_entity c-base_entity--medium c-base_entity--has-avatar c-base_entity--vertically-center" data-id="F01M10S61FY" data-sk="medium_file_entity"><div class="p-file_thumbnail__container p-file_thumbnail__container--other c-file_entity_thumbnail_icon c-base_entity__avatar" aria-hidden="false" style="width: 36px; height: 36px;"><div><div class="p-quip_icon_container p-quip_icon_container__ia4_icon"><svg data-9gn="true" aria-hidden="true" type="quip" viewBox="0 0 20 20" class="" style="--s: 20px;"><path fill="currentColor" fill-rule="evenodd" d="M5.25 1.5A3.75 3.75 0 0 0 1.5 5.25v9.5a3.75 3.75 0 0 0 3.75 3.75h5.736c.729 0 1.428-.29 1.944-.805l4.765-4.765a2.75 2.75 0 0 0 .805-1.944V5.25a3.75 3.75 0 0 0-3.75-3.75h-9.5Zm7 9.25a1.5 1.5 0 0 0-1.5 1.5v3.25a.75.75 0 0 0 1.5 0v-2.75a.5.5 0 0 1 .5-.5h2.75a.75.75 0 0 0 0-1.5h-3.25ZM5.5 5.85a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5h-2Z" clip-rule="evenodd"></path></svg></div></div></div><div class="c-base_entity__text-contents"><span class="c-file_entity__text c-file_entity__text--first-line c-file_entity__text--first-line__flex c-base_entity__text" data-qa="file-entity-metadata-title"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span data-qa="file_name">Feb 5th Clean Slate notes</span></span></span><div class="c-file_entity-user-timestamp" data-qa="file-entity-metadata-description"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span class="c-file_entity-user-timestamp c-file-entity-bold-description c-base_entity__text"><span class="c-truncate c-truncate--break_words" style="--lines: 1;"><span class="c-file_entity-user-timestamp__user-channel-files" data-qa="file-entity-metadata-user">Shared by Micah</span>&nbsp;<span class="c-file_entity-user-timestamp__timestamp" data-qa="file-entity-metadata-timestamp">on Feb 5th, 2021</span></span></span></span></div></div></div></div></div><div class="c-file__actions c-message_actions__container c-message_actions__group" aria-label="Feb 5th Clean Slate notes: More actions" data-qa="file_actions"><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Share Feb 5th Clean Slate notes" data-qa="share_file" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10.457 2.56a.75.75 0 0 1 .814.15l7 6.75a.75.75 0 0 1 0 1.08l-7 6.75A.75.75 0 0 1 10 16.75V13.5H6c-1.352 0-2.05.389-2.43.832-.4.465-.57 1.133-.57 1.918a.75.75 0 0 1-1.5 0V14c0-2.594.582-4.54 2-5.809C4.898 6.941 6.944 6.5 9.5 6.5h.5V3.25c0-.3.18-.573.457-.69ZM3.052 12.79C3.777 12.278 4.753 12 6 12h4.75a.75.75 0 0 1 .75.75v2.235L16.67 10 11.5 5.015V7.25a.75.75 0 0 1-.75.75H9.5c-2.444 0-4.023.434-5 1.309-.784.702-1.29 1.788-1.448 3.481Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Feb 5th Clean Slate notes: More actions" aria-haspopup="menu" data-qa="more_file_actions" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0Z" clip-rule="evenodd"></path></svg></button></div></div></div><div aria-setsize="-1" class="c-virtual_list__item" tabindex="-1" role="listitem" id="files_600245af-e883-490b-a9db-45c00cead993" data-qa="virtual-list-item" data-item-key="files_600245af-e883-490b-a9db-45c00cead993" style="top: 411px;"><div class="c-pillow_file_container p-search_file p-search_file--file-entity p-search_file--ia4" data-qa="search_result_file" role="group" aria-label="CMR Consent Form - Notifications.docx undefined"><div class="c-pillow_file c-pillow_file--clickable c-pillow_file--view" data-qa="message_file_link"><div class="c-file_entity"><div class="c-file_entity__medium_base_entity c-base_entity c-base_entity--medium c-base_entity--has-avatar c-base_entity--vertically-center" data-id="FUNP2EUP8" data-sk="medium_file_entity"><div class="p-file_thumbnail__container p-file_thumbnail__container--other c-file_entity_thumbnail_icon c-base_entity__avatar" aria-hidden="false" style="width: 36px; height: 36px;"><i class="c-icon c-icon__file p-file_thumbnail__file_icon c-icon--file-word c-icon--file-word-svgicon c-icon--filetype-svgicon" data-qa="file_thumbnail_icon" type="docx" aria-hidden="true"></i></div><div class="c-base_entity__text-contents"><span class="c-file_entity__text c-file_entity__text--first-line c-file_entity__text--first-line__flex c-base_entity__text" data-qa="file-entity-metadata-title"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span data-qa="file_name">CMR Consent Form - Notifications.docx</span></span></span><div class="c-file_entity-user-timestamp" data-qa="file-entity-metadata-description"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span class="c-file_entity-user-timestamp c-file-entity-bold-description c-base_entity__text"><span class="c-truncate c-truncate--break_words" style="--lines: 1;"><span class="c-file_entity-user-timestamp__user-channel-files" data-qa="file-entity-metadata-user">Shared by meilani</span>&nbsp;<span class="c-file_entity-user-timestamp__timestamp" data-qa="file-entity-metadata-timestamp">on Feb 27th, 2020</span></span></span></span></div></div></div></div></div><div class="c-file__actions c-message_actions__container c-message_actions__group" aria-label="CMR Consent Form - Notifications.docx: More actions" data-qa="file_actions"><a target="_blank" class="c-link c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Download CMR Consent Form - Notifications.docx" data-qa="download_action" delay="60" data-sk="tooltip_parent" href="https://files.slack.com/files-pri/T024F66L9-FUNP2EUP8/download/cmr_consent_form_-_notifications.docx?origin_team=T024F66L9" rel="noopener noreferrer"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M11.75 4a3.752 3.752 0 0 0-3.512 2.432.75.75 0 0 1-.941.447 2.5 2.5 0 0 0-2.937 3.664.75.75 0 0 1-.384 1.093A2.251 2.251 0 0 0 4.75 16h9.5a3.25 3.25 0 0 0 1.44-6.164.75.75 0 0 1-.379-.908A3.75 3.75 0 0 0 11.75 4ZM7.108 5.296a5.25 5.25 0 0 1 9.786 3.508A4.75 4.75 0 0 1 14.25 17.5h-9.5a3.75 3.75 0 0 1-2.02-6.91 4 4 0 0 1 4.378-5.294ZM10.25 7.5a.75.75 0 0 1 .75.75v3.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V8.25a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path></svg></a><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Share CMR Consent Form - Notifications.docx" data-qa="share_file" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10.457 2.56a.75.75 0 0 1 .814.15l7 6.75a.75.75 0 0 1 0 1.08l-7 6.75A.75.75 0 0 1 10 16.75V13.5H6c-1.352 0-2.05.389-2.43.832-.4.465-.57 1.133-.57 1.918a.75.75 0 0 1-1.5 0V14c0-2.594.582-4.54 2-5.809C4.898 6.941 6.944 6.5 9.5 6.5h.5V3.25c0-.3.18-.573.457-.69ZM3.052 12.79C3.777 12.278 4.753 12 6 12h4.75a.75.75 0 0 1 .75.75v2.235L16.67 10 11.5 5.015V7.25a.75.75 0 0 1-.75.75H9.5c-2.444 0-4.023.434-5 1.309-.784.702-1.29 1.788-1.448 3.481Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="CMR Consent Form - Notifications.docx: More actions" aria-haspopup="menu" data-qa="more_file_actions" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0Z" clip-rule="evenodd"></path></svg></button></div></div></div><div aria-setsize="-1" class="c-virtual_list__item" tabindex="-1" role="listitem" id="files_ae423a3d-0322-42c8-855d-dced319ecfe8" data-qa="virtual-list-item" data-item-key="files_ae423a3d-0322-42c8-855d-dced319ecfe8" style="top: 472px;"><div class="c-pillow_file_container p-search_file p-search_file--file-entity p-search_file--ia4" data-qa="search_result_file" role="group" aria-label="FairHousingCriminalHistoryFAQ_ENG.pdf undefined"><div class="c-pillow_file c-pillow_file--clickable c-pillow_file--view" data-qa="message_file_link"><div class="c-file_entity"><div class="c-file_entity__medium_base_entity c-base_entity c-base_entity--medium c-base_entity--has-avatar c-base_entity--vertically-center" data-id="F041EG4HT99" data-sk="medium_file_entity"><div class="p-file_thumbnail__container p-file_thumbnail__container--other c-file_entity_thumbnail_icon c-base_entity__avatar" aria-hidden="false" style="width: 36px; height: 36px;"><i class="c-icon c-icon__file p-file_thumbnail__file_icon c-icon--file-pdf c-icon--file-pdf-svgicon c-icon--filetype-svgicon" data-qa="file_thumbnail_icon" type="pdf" aria-hidden="true"></i></div><div class="c-base_entity__text-contents"><span class="c-file_entity__text c-file_entity__text--first-line c-file_entity__text--first-line__flex c-base_entity__text" data-qa="file-entity-metadata-title"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span data-qa="file_name">FairHousingCriminalHistoryFAQ_ENG.pdf</span></span></span><div class="c-file_entity-user-timestamp" data-qa="file-entity-metadata-description"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span class="c-file_entity-user-timestamp c-file-entity-bold-description c-base_entity__text"><span class="c-truncate c-truncate--break_words" style="--lines: 1;"><span class="c-file_entity-user-timestamp__user-channel-files" data-qa="file-entity-metadata-user">Shared by Shirley Haruka Bekins</span>&nbsp;<span class="c-file_entity-user-timestamp__timestamp" data-qa="file-entity-metadata-timestamp">on Sep 7th, 2022</span></span></span></span></div></div></div></div></div><div class="c-file__actions c-message_actions__container c-message_actions__group" aria-label="FairHousingCriminalHistoryFAQ_ENG.pdf: More actions" data-qa="file_actions"><a target="_blank" class="c-link c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Download FairHousingCriminalHistoryFAQ_ENG.pdf" data-qa="download_action" delay="60" data-sk="tooltip_parent" href="https://files.slack.com/files-pri/T024F66L9-F041EG4HT99/download/fairhousingcriminalhistoryfaq_eng.pdf?origin_team=T024F66L9" rel="noopener noreferrer"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M11.75 4a3.752 3.752 0 0 0-3.512 2.432.75.75 0 0 1-.941.447 2.5 2.5 0 0 0-2.937 3.664.75.75 0 0 1-.384 1.093A2.251 2.251 0 0 0 4.75 16h9.5a3.25 3.25 0 0 0 1.44-6.164.75.75 0 0 1-.379-.908A3.75 3.75 0 0 0 11.75 4ZM7.108 5.296a5.25 5.25 0 0 1 9.786 3.508A4.75 4.75 0 0 1 14.25 17.5h-9.5a3.75 3.75 0 0 1-2.02-6.91 4 4 0 0 1 4.378-5.294ZM10.25 7.5a.75.75 0 0 1 .75.75v3.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V8.25a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path></svg></a><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Share FairHousingCriminalHistoryFAQ_ENG.pdf" data-qa="share_file" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10.457 2.56a.75.75 0 0 1 .814.15l7 6.75a.75.75 0 0 1 0 1.08l-7 6.75A.75.75 0 0 1 10 16.75V13.5H6c-1.352 0-2.05.389-2.43.832-.4.465-.57 1.133-.57 1.918a.75.75 0 0 1-1.5 0V14c0-2.594.582-4.54 2-5.809C4.898 6.941 6.944 6.5 9.5 6.5h.5V3.25c0-.3.18-.573.457-.69ZM3.052 12.79C3.777 12.278 4.753 12 6 12h4.75a.75.75 0 0 1 .75.75v2.235L16.67 10 11.5 5.015V7.25a.75.75 0 0 1-.75.75H9.5c-2.444 0-4.023.434-5 1.309-.784.702-1.29 1.788-1.448 3.481Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="FairHousingCriminalHistoryFAQ_ENG.pdf: More actions" aria-haspopup="menu" data-qa="more_file_actions" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0Z" clip-rule="evenodd"></path></svg></button></div></div></div><div aria-setsize="-1" class="c-virtual_list__item" tabindex="-1" role="listitem" id="files_39d502f8-0a2a-49c7-8799-224662f5e4c8" data-qa="virtual-list-item" data-item-key="files_39d502f8-0a2a-49c7-8799-224662f5e4c8" style="top: 533px;"><div class="c-pillow_file_container p-search_file p-search_file--file-entity p-search_file--ia4" data-qa="search_result_file" role="group" aria-label="Record Clearance Brigade Congress Session undefined"><div class="c-pillow_file c-pillow_file--clickable" data-qa="message_file_link"><div class="c-file_entity"><div class="c-file_entity__medium_base_entity c-base_entity c-base_entity--medium c-base_entity--has-avatar c-base_entity--vertically-center" data-id="F01C43VKFQ8" data-sk="medium_file_entity"><div class="p-file_thumbnail__container p-file_thumbnail__container--other c-file_entity_thumbnail_icon c-base_entity__avatar" aria-hidden="false" style="width: 36px; height: 36px;"><i class="c-icon c-icon__file p-file_thumbnail__file_icon c-icon--file-google-document c-icon--file-google-document-svgicon c-icon--filetype-svgicon" data-qa="file_thumbnail_icon" type="gdoc" aria-hidden="true"></i></div><div class="c-base_entity__text-contents"><span class="c-file_entity__text c-file_entity__text--first-line c-file_entity__text--first-line__flex c-base_entity__text" data-qa="file-entity-metadata-title"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span data-qa="file_name">Record Clearance Brigade Congress Session</span></span></span><div class="c-file_entity-user-timestamp" data-qa="file-entity-metadata-description"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span class="c-file_entity-user-timestamp c-file-entity-bold-description c-base_entity__text"><span class="c-truncate c-truncate--break_words" style="--lines: 1;"><span class="c-file_entity-user-timestamp__user-channel-files" data-qa="file-entity-metadata-user">Shared by NFlourish (he, C4BTV in VT)</span>&nbsp;<span class="c-file_entity-user-timestamp__timestamp" data-qa="file-entity-metadata-timestamp">on Sep 25th, 2020</span></span></span></span></div></div></div></div></div><div class="c-file__actions c-message_actions__container c-message_actions__group" aria-label="Record Clearance Brigade Congress Session: More actions" data-qa="file_actions"><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Share Record Clearance Brigade Congress Session" data-qa="share_file" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10.457 2.56a.75.75 0 0 1 .814.15l7 6.75a.75.75 0 0 1 0 1.08l-7 6.75A.75.75 0 0 1 10 16.75V13.5H6c-1.352 0-2.05.389-2.43.832-.4.465-.57 1.133-.57 1.918a.75.75 0 0 1-1.5 0V14c0-2.594.582-4.54 2-5.809C4.898 6.941 6.944 6.5 9.5 6.5h.5V3.25c0-.3.18-.573.457-.69ZM3.052 12.79C3.777 12.278 4.753 12 6 12h4.75a.75.75 0 0 1 .75.75v2.235L16.67 10 11.5 5.015V7.25a.75.75 0 0 1-.75.75H9.5c-2.444 0-4.023.434-5 1.309-.784.702-1.29 1.788-1.448 3.481Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Record Clearance Brigade Congress Session: More actions" aria-haspopup="menu" data-qa="more_file_actions" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0Z" clip-rule="evenodd"></path></svg></button></div></div></div><div aria-setsize="-1" class="c-virtual_list__item" tabindex="-1" role="listitem" id="files_b4ed49c2-ae8a-4883-aa0b-1777d82ea18a" data-qa="virtual-list-item" data-item-key="files_b4ed49c2-ae8a-4883-aa0b-1777d82ea18a" style="top: 594px;"><div class="c-pillow_file_container p-search_file p-search_file--file-entity p-search_file--ia4" data-qa="search_result_file" role="group" aria-label="Screen Shot 2021-01-21 at 3.12.16 PM.png undefined"><div class="c-pillow_file c-pillow_file--clickable c-pillow_file--view" data-qa="message_file_link"><div class="c-file_entity"><div class="c-file_entity__medium_base_entity c-base_entity c-base_entity--medium c-base_entity--has-avatar c-base_entity--vertically-center" data-id="F01KGBBPCEN" data-sk="medium_file_entity"><div class="p-file_thumbnail__container p-file_thumbnail__container--image c-file_entity_thumbnail_icon c-base_entity__avatar c-file_entity_thumbnail_icon--img-border" aria-hidden="false" style="width: 36px; height: 36px;"><div class="p-file_thumbnail__tiny_thumb_wrapper" style="height: 36px; width: 36px;"><img class="p-file_thumbnail__image p-file_thumbnail__img" alt="Screen Shot 2021-01-21 at 3.12.16 PM.png" src="https://files.slack.com/files-tmb/T024F66L9-F01KGBBPCEN-d0109516a8/screen_shot_2021-01-21_at_3.12.16_pm_80.png" height="36" width="36" data-qa="file_thumbnail_img"></div></div><div class="c-base_entity__text-contents"><span class="c-file_entity__text c-file_entity__text--first-line c-file_entity__text--first-line__flex c-base_entity__text" data-qa="file-entity-metadata-title"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span data-qa="file_name">Screen Shot 2021-01-21 at 3.12.16 PM.png</span></span></span><div class="c-file_entity-user-timestamp" data-qa="file-entity-metadata-description"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span class="c-file_entity-user-timestamp c-file-entity-bold-description c-base_entity__text"><span class="c-truncate c-truncate--break_words" style="--lines: 1;"><span class="c-file_entity-user-timestamp__user-channel-files" data-qa="file-entity-metadata-user">Shared by Em (they/them)</span>&nbsp;<span class="c-file_entity-user-timestamp__timestamp" data-qa="file-entity-metadata-timestamp">on Jan 21st, 2021</span></span></span></span></div></div></div></div></div><div class="c-file__actions c-message_actions__container c-message_actions__group" aria-label="Screen Shot 2021-01-21 at 3.12.16 PM.png: More actions" data-qa="file_actions"><a target="_blank" class="c-link c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Download Screen Shot 2021-01-21 at 3.12.16 PM.png" data-qa="download_action" delay="60" data-sk="tooltip_parent" href="https://files.slack.com/files-pri/T024F66L9-F01KGBBPCEN/download/screen_shot_2021-01-21_at_3.12.16_pm.png?origin_team=T024F66L9" rel="noopener noreferrer"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M11.75 4a3.752 3.752 0 0 0-3.512 2.432.75.75 0 0 1-.941.447 2.5 2.5 0 0 0-2.937 3.664.75.75 0 0 1-.384 1.093A2.251 2.251 0 0 0 4.75 16h9.5a3.25 3.25 0 0 0 1.44-6.164.75.75 0 0 1-.379-.908A3.75 3.75 0 0 0 11.75 4ZM7.108 5.296a5.25 5.25 0 0 1 9.786 3.508A4.75 4.75 0 0 1 14.25 17.5h-9.5a3.75 3.75 0 0 1-2.02-6.91 4 4 0 0 1 4.378-5.294ZM10.25 7.5a.75.75 0 0 1 .75.75v3.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V8.25a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path></svg></a><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Share Screen Shot 2021-01-21 at 3.12.16 PM.png" data-qa="share_file" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10.457 2.56a.75.75 0 0 1 .814.15l7 6.75a.75.75 0 0 1 0 1.08l-7 6.75A.75.75 0 0 1 10 16.75V13.5H6c-1.352 0-2.05.389-2.43.832-.4.465-.57 1.133-.57 1.918a.75.75 0 0 1-1.5 0V14c0-2.594.582-4.54 2-5.809C4.898 6.941 6.944 6.5 9.5 6.5h.5V3.25c0-.3.18-.573.457-.69ZM3.052 12.79C3.777 12.278 4.753 12 6 12h4.75a.75.75 0 0 1 .75.75v2.235L16.67 10 11.5 5.015V7.25a.75.75 0 0 1-.75.75H9.5c-2.444 0-4.023.434-5 1.309-.784.702-1.29 1.788-1.448 3.481Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Screen Shot 2021-01-21 at 3.12.16 PM.png: More actions" aria-haspopup="menu" data-qa="more_file_actions" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0Z" clip-rule="evenodd"></path></svg></button></div></div></div><div aria-setsize="-1" class="c-virtual_list__item" tabindex="-1" role="listitem" id="files_7352d8b7-2df0-416d-8145-24c3597bc5f4" data-qa="virtual-list-item" data-item-key="files_7352d8b7-2df0-416d-8145-24c3597bc5f4" style="top: 655px;"><div class="c-pillow_file_container p-search_file p-search_file--file-entity p-search_file--ia4" data-qa="search_result_file" role="group" aria-label="Screen Shot 2021-04-11 at 9.11.19 PM.png undefined"><div class="c-pillow_file c-pillow_file--clickable c-pillow_file--view" data-qa="message_file_link"><div class="c-file_entity"><div class="c-file_entity__medium_base_entity c-base_entity c-base_entity--medium c-base_entity--has-avatar c-base_entity--vertically-center" data-id="F01UV5MRF4Y" data-sk="medium_file_entity"><div class="p-file_thumbnail__container p-file_thumbnail__container--image c-file_entity_thumbnail_icon c-base_entity__avatar c-file_entity_thumbnail_icon--img-border" aria-hidden="false" style="width: 36px; height: 36px;"><div class="p-file_thumbnail__tiny_thumb_wrapper" style="height: 36px; width: 36px;"><img class="p-file_thumbnail__image p-file_thumbnail__img" alt="Screen Shot 2021-04-11 at 9.11.19 PM.png" src="https://files.slack.com/files-tmb/T024F66L9-F01UV5MRF4Y-1e6f12c35d/screen_shot_2021-04-11_at_9.11.19_pm_80.png" height="36" width="36" data-qa="file_thumbnail_img"></div></div><div class="c-base_entity__text-contents"><span class="c-file_entity__text c-file_entity__text--first-line c-file_entity__text--first-line__flex c-base_entity__text" data-qa="file-entity-metadata-title"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span data-qa="file_name">Screen Shot 2021-04-11 at 9.11.19 PM.png</span></span></span><div class="c-file_entity-user-timestamp" data-qa="file-entity-metadata-description"><span class="c-truncate c-truncate--break_words" delay="150" data-sk="tooltip_parent" style="--lines: 1;"><span class="c-file_entity-user-timestamp c-file-entity-bold-description c-base_entity__text"><span class="c-truncate c-truncate--break_words" style="--lines: 1;"><span class="c-file_entity-user-timestamp__user-channel-files" data-qa="file-entity-metadata-user">Shared by Hayden Betts</span>&nbsp;<span class="c-file_entity-user-timestamp__timestamp" data-qa="file-entity-metadata-timestamp">on Apr 13th, 2021</span></span></span></span></div></div></div></div></div><div class="c-file__actions c-message_actions__container c-message_actions__group" aria-label="Screen Shot 2021-04-11 at 9.11.19 PM.png: More actions" data-qa="file_actions"><a target="_blank" class="c-link c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Download Screen Shot 2021-04-11 at 9.11.19 PM.png" data-qa="download_action" delay="60" data-sk="tooltip_parent" href="https://files.slack.com/files-pri/T024F66L9-F01UV5MRF4Y/download/screen_shot_2021-04-11_at_9.11.19_pm.png?origin_team=T024F66L9" rel="noopener noreferrer"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M11.75 4a3.752 3.752 0 0 0-3.512 2.432.75.75 0 0 1-.941.447 2.5 2.5 0 0 0-2.937 3.664.75.75 0 0 1-.384 1.093A2.251 2.251 0 0 0 4.75 16h9.5a3.25 3.25 0 0 0 1.44-6.164.75.75 0 0 1-.379-.908A3.75 3.75 0 0 0 11.75 4ZM7.108 5.296a5.25 5.25 0 0 1 9.786 3.508A4.75 4.75 0 0 1 14.25 17.5h-9.5a3.75 3.75 0 0 1-2.02-6.91 4 4 0 0 1 4.378-5.294ZM10.25 7.5a.75.75 0 0 1 .75.75v3.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V8.25a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path></svg></a><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Share Screen Shot 2021-04-11 at 9.11.19 PM.png" data-qa="share_file" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10.457 2.56a.75.75 0 0 1 .814.15l7 6.75a.75.75 0 0 1 0 1.08l-7 6.75A.75.75 0 0 1 10 16.75V13.5H6c-1.352 0-2.05.389-2.43.832-.4.465-.57 1.133-.57 1.918a.75.75 0 0 1-1.5 0V14c0-2.594.582-4.54 2-5.809C4.898 6.941 6.944 6.5 9.5 6.5h.5V3.25c0-.3.18-.573.457-.69ZM3.052 12.79C3.777 12.278 4.753 12 6 12h4.75a.75.75 0 0 1 .75.75v2.235L16.67 10 11.5 5.015V7.25a.75.75 0 0 1-.75.75H9.5c-2.444 0-4.023.434-5 1.309-.784.702-1.29 1.788-1.448 3.481Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-message_actions__button c-icon_button--default" aria-label="Screen Shot 2021-04-11 at 9.11.19 PM.png: More actions" aria-haspopup="menu" data-qa="more_file_actions" delay="60" data-sk="tooltip_parent" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0Z" clip-rule="evenodd"></path></svg></button></div></div></div><div aria-setsize="-1" class="c-virtual_list__item" tabindex="-1" role="listitem" id="pager" data-qa="virtual-list-item" data-item-key="pager" style="top: 1266px;"><div class="c-search__results_pager"><div class="c-search__pager_search_as_a_page c-search__pager--virtualized"><span class="c-search__pager_search_as_a_page_feedback"><span id="something-off-text-node"></span><button id="give-feedback-text-node" tabindex="0" aria-labelledby="something-off-text-node give-feedback-text-node" class="c-link--button" type="button">Give feedback</button></span><div class="c-pagination_wrapper" data-qa-current-page="1"><div class="c-pagination__container" role="group" aria-label="Pagination"><span hidden="" id="pagination-arrow-key-instructions-node">Use left and right arrow keys to select a page</span><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-pagination__arrow_btn c-button--disabled c-icon_button--default" data-qa="c-pagination_back_btn" aria-label="Previous page" tabindex="-1" disabled="" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M12.03 5.72a.75.75 0 0 1 0 1.06L8.81 10l3.22 3.22a.75.75 0 1 1-1.06 1.06l-3.75-3.75a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-pagination__page_btn c-pagination__page_btn--active" aria-current="page" tabindex="0" data-qa="c-pagination_page_btn_1" aria-label="Page 1" aria-describedby="pagination-arrow-key-instructions-node" type="button">1</button><button class="c-button-unstyled c-pagination__page_btn" aria-current="false" tabindex="-1" data-qa="c-pagination_page_btn_2" aria-label="Page 2" aria-describedby="pagination-arrow-key-instructions-node" type="button">2</button><button class="c-button-unstyled c-pagination__page_btn" aria-current="false" tabindex="-1" data-qa="c-pagination_page_btn_3" aria-label="Page 3" aria-describedby="pagination-arrow-key-instructions-node" type="button">3</button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-pagination__arrow_btn c-icon_button--default" data-qa="c-pagination_forward_btn" aria-label="Next page" tabindex="-1" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M7.72 5.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 0 1-1.06-1.06L10.94 10 7.72 6.78a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg></button></div></div></div></div></div></div></div></div>
  Top: 50 + 50 + 30. Items: 60. Bottom: 36. Total: 166 + 1200 = 1366. 2k
    height should be enough, but we should print num items, pagination id,
    to make sure.
  paginators: <div class="c-pagination__container" role="group" aria-label="Pagination"><span hidden="" id="pagination-arrow-key-instructions-node">Use left and right arrow keys to select a page</span><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-pagination__arrow_btn c-button--disabled c-icon_button--default" data-qa="c-pagination_back_btn" aria-label="Previous page" tabindex="-1" disabled="" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M12.03 5.72a.75.75 0 0 1 0 1.06L8.81 10l3.22 3.22a.75.75 0 1 1-1.06 1.06l-3.75-3.75a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"></path></svg></button><button class="c-button-unstyled c-pagination__page_btn c-pagination__page_btn--active" aria-current="page" tabindex="0" data-qa="c-pagination_page_btn_1" aria-label="Page 1" aria-describedby="pagination-arrow-key-instructions-node" type="button">1</button><button class="c-button-unstyled c-pagination__page_btn" aria-current="false" tabindex="-1" data-qa="c-pagination_page_btn_2" aria-label="Page 2" aria-describedby="pagination-arrow-key-instructions-node" type="button">2</button><button class="c-button-unstyled c-pagination__page_btn" aria-current="false" tabindex="-1" data-qa="c-pagination_page_btn_3" aria-label="Page 3" aria-describedby="pagination-arrow-key-instructions-node" type="button">3</button><button class="c-button-unstyled c-icon_button c-icon_button--size_small c-pagination__arrow_btn c-icon_button--default" data-qa="c-pagination_forward_btn" aria-label="Next page" tabindex="-1" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M7.72 5.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 0 1-1.06-1.06L10.94 10 7.72 6.78a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg></button></div>
  next button: <button class="c-button-unstyled c-icon_button c-icon_button--size_small c-pagination__arrow_btn c-icon_button--default" data-qa="c-pagination_forward_btn" aria-label="Next page" tabindex="-1" type="button"><svg data-9gn="true" aria-hidden="true" viewBox="0 0 20 20" class=""><path fill="currentColor" fill-rule="evenodd" d="M7.72 5.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 0 1-1.06-1.06L10.94 10 7.72 6.78a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg></button>
Could just use scraper to get urls and have humans put them into browser.

First thoughts:
Maybe puppeteer download: https://www.phind.com/search?cache=rbpyjs67h37mraympowvncwt

Do file download names have any relationship to thumbnail names???
png
  thumbnail: src="https://files.slack.com/files-tmb/T024F66L9-F031GNUHNQY-5afdfe8048/different_kind_of_tags_maybe_480.png"
  download: href="https://files.slack.com/files-pri/T024F66L9-F031GNUHNQY/download/different_kind_of_tags_maybe.png?origin_team=T024F66L9" (team = url? url: https://app.slack.com/client/T024F66L9/DATL8MFJ9)
mp4
  thumbnail: style="background-image: url(&quot;https://files.slack.com/files-tmb/T024F66L9-F02UT2JEM9V-eb8d305b03/file_from_ios_thumb_video.jpeg&quot;);"
  can click "download" button in "more actions" menu, but no link
  download: href="https://files.slack.com/files-pri/T024F66L9-F02UT2JEM9V/download/file_from_ios.mp4?origin_team=T024F66L9"
  does not include 'mp4' file-type?
pdf
  thumbnail: style="background-image: url(&quot;https://files.slack.com/files-tmb/T024F66L9-F0674TQB925-e43741746b/209a_258e_motion_for_impoundment_thumb_pdf.png&quot;);"
  download: href="https://files.slack.com/files-pri/T024F66L9-F0674TQB925/download/209a_258e_motion_for_impoundment.pdf?origin_team=T024F66L9"
  still have to expand unexpanded

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
  try {
    await try_to_collect();
  } catch (error) {
    console.log(`x Errored at: ${new Date().toLocaleString()}`);
    await page.screenshot({ path: `page_error.jpg` });
    const body = await page.evaluate(`body`, (elem)=>{ return elem.outerHTML });
    console.log(body);
    throw error;
  }
  console.log(`✔ Ended at: ${new Date().toLocaleString()}`);
}

async function try_to_collect() {
  log.debug(`start()`);
  const browser = await puppeteer.launch({
    // Have to interact with the browser prompt manually
    headless: !process.env.DEBUG,
    devtools: process.env.DEBUG,
  });
  page = await browser.newPage();

  console.log(`Current date and time: ${new Date().toLocaleString()}`);

  // Make very big viewport?
  const v_width = 1000
  await page.setViewport({ height: config.viewport_height, width: v_width });
  console.log(`The window is ${ config.viewport_height }px tall and ${ v_width }px wide`);
  log.print_inline({ message: 'Starting... ' });
  await go_to_log_in();
  await auth();
  // TODO: Create folder for channel if it doesn't exist
  // TODO: loop through channels
  await go_to_channel({ channel_name: state.current_channel });
  log.print_inline({ message: 'Now-ish! \n' });
  await collect_channel({ config, state });
  log.print_inline({ message: 'Done. Everything is probably fine.\n' });

  // // Prepare for downloading
  // await page._client.send(`Page.setDownloadBehavior`, {
  //   behavior: `allow`,
  //   downloadPath: `./data/${ state.current_channel }/downloads`,
  // });
  // // Download files

  await browser.close();
};

async function go_to_log_in() {
  log.debug(`go_to_log_in()`);
  await page.goto(process.env.WORKSPACE, { waitUntil: `domcontentloaded` });
  await page.waitForSelector(`input[type="submit"]`);
  let [email_reponse] = await Promise.all([
    page.waitForNavigation({ waitUntil: `domcontentloaded` }),
    // Choose to log in by email
    page.click(`input[type="submit"]`),
  ]);
};

async function auth() {
  await page.waitForSelector(`input#email`);
  await page.type(`input#email`, process.env.EMAIL);
  await page.type(`input#password`, process.env.PASSWORD);
  // Submit and go to workspace
  // TODO: handle wrong email/password
  let [auth_reponse] = await Promise.all([
    page.waitForNavigation({ waitUntil: `domcontentloaded` }),
    page.click(`button[type="submit"]`),
  ]);
  try {
    await page.waitForSelector(`.p-ssb_redirect__loading_messages .c-link`);
    let [slack_in_browser] = await Promise.all([
      page.waitForNavigation({ waitUntil: `domcontentloaded` }),
      // Choose to log in by email
      page.click(`.p-ssb_redirect__loading_messages .c-link`),
    ]);
  } catch (error) {
    // guess it doesn't exist this time...
  }
  await wait_for_load({ seconds: 20 });
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

    console.log(`* channel - collecting at:`, state.position);
    const top_date = await page.evaluate((elem) => {
      const date_elem = document.querySelector('.c-button-unstyled.c-message_list__day_divider__label__pill');
      if ( date_elem && date_elem.textContent ) {
        return date_elem.textContent;
      } else {
        return `not visible`;
      }
    }, `.c-button-unstyled.c-message_list__day_divider__label__pill`);
    console.log(`Current top-most date: ${top_date}`);
    // Collect current view's elements
    let messages = await get_message_container_data();  // name? `get_current_messages_data`
    let threads = await collect_threads({ ids: messages.reply_ids });  // `collect_message_threads`?
    // Save in case of errors or computers going to sleep
    save_data({
      config, state,
      data: { messages: messages.html, threads }
    });
    // Save new start for next run of loop or script, but before scrolling
    // so that we don't save position before the new position has been
    // collected.
    save_state({ config, state });
    // Scroll to new spot
    let scroller_handle = await page.waitForSelector(CHANNEL_SCROLLER_SELECTOR);
    state.position += await scroll_towards({
      goal_position, position: state.position, scroller_handle
    });
    // log.print_inline({ message: 'M' });
    // Decide if this is the last section we'll need to collect
    reached_goal = await reached_channel_goal({ position: state.position, goal_position });
  }  // ends while need to collect
};  // Ends collect_channel()

async function scroll_to_start ({ state, config }) {
  log.debug(`scroll_to_start()`);

  // I keep forgetting to reset to 0
  if ( state.position !== 0 ) {
    console.log(`\n==== TAKE NOTE!! Starting position is NOT`, 0, `====\n`);
  }

  console.log(`scroll to starting position in the channel "${ state.current_channel }". Starting position is`, state.position);
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

async function scroll_towards ({ position, goal_position, scroller_handle, direction }) {
  /** Returns distance traveled int, negative or positive depending on direction */
  log.debug(`scroll_towards() direction: ${ direction }`);

  let vector = direction;
  if ( !direction ) {
    vector = -1;  // up by default
  } else if ( direction === `up` || direction === -1 ) {
    vector = -1;  // up
  } else {
    vector = 1;  // down
  }

  const scroller_height = await scroller_handle.evaluate( (element) => {
    return element.clientHeight;
  });
  // soooooo nested
  const distance_and_direction = calculate_scroll_distance({
    current_position: position,
    goal_position,
    scroller_height,
    direction: vector
  });
  await scroller_handle.evaluate( (element, { distance_and_direction }) => {
    element.scrollBy(0, distance_and_direction);
  }, { distance_and_direction });
  // Avoid "Loading replies..."
  await wait_for_movement({ seconds: 2 });

  return distance_and_direction;
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

function calculate_scroll_distance ({ current_position, goal_position, scroller_height, direction }) {
  /** Returns negative or positive in of how far was traveled in which direction.
   *   The direction is whether the distance was positive or negative. */
  log.debug(`calculate_scroll_distance(): goal_position ${goal_position}, pos ${current_position}, diff ${goal_position - current_position}`);
  // Don't overshoot. Math justification:
  // goal_position = 10, current_position = 1, distance = 20, desired = 9
  // goal_position = 100, current_position = 1, distance = 20, desired = 20
  // min( 10 - 1, 20) = 9, min( 100 - 1, 20) = 20

  // If dev wants to get to the top, scroll the maximum distance allowed
  if ([ `end`, `top`, `bottom`, `infinite`, `all` ].includes( goal_position )) {
    // Scroll one full page - as far as possible
    log.debug(`scroll distance (scroller height): ${ direction * scroller_height }`);
    return direction * scroller_height;
  }

  // Math.abs: Make sure direction of these individual items doesn't matter
  const positive_distance_to_goal = Math.abs( goal_position - current_position );
  const positive_actual_distance = Math.min(
    positive_distance_to_goal, scroller_height
  );
  log.debug(`scroll distance (min): ${ direction * positive_actual_distance }`);
  return direction * positive_actual_distance;
}

async function reached_channel_goal ({ position, goal_position }) {
  log.debug(`reached_channel_goal()`);
  let reached_end = false;
  let top = await page.$(`h1.p-message_pane__foreword__title`);
  if ( top ) {
    console.log(`--- reached top of channel ---`);
    // log.debug(`--- at top of channel ---`);
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
    console.log(`id of the message that contains this thread:`, id);
    let thread_handle = await open_thread({ id });
    // log.print_inline({ message: 't' });
    let data = await collect_thread({ thread_handle, id });
    await close_thread({ thread_handle });
    threads[id] = data;
  }
  return threads;
}

async function open_thread ({ id }) {
  log.debug(`open_thread() id: ${ id }`);
  // Note: page.$() as querySelectorAll won't work with these
  // ids (Example id: 1668547054.805359).
  await page.evaluate(( id ) => {
    let elem = document.getElementById(id);
    elem.querySelector('.c-message__reply_count').click();
  }, id );
  await wait_for_movement({ seconds: 2 });
  let thread_handle = await page.waitForSelector(`div[data-qa="threads_flexpane"]`);
  log.debug(`thread_handle:`, thread_handle);
  return thread_handle
}

async function collect_thread ({ thread_handle, id }) {
  log.debug(`collect_thread()`);
  let thread_items = [];
  let position = 0;

  // Start at the bottom (depending on user's last interaction with
  // this thread in Slack, they could be at the middle or top)
  // Assumption is that the user has read this thread already, being
  // a user of the Slack channel, so the bottom is closer.

  // TODO: actually, in a private window, it seems to start at the top?
  // I'm not sure what puppeteer windows are like. I assume like private
  // windows...
  await scroll_to_thread_bottom({ thread_handle, id, position });

  // Might already be at top if the thread doesn't need any scrolling
  let reached_end = await reached_thread_top({ thread_handle, id });

  // Go once, reach end, go once more. Deduplicate during processing.
  let final_round_done = false;
  let abort = false;
  while ( !abort && !final_round_done ) {
    // If reached bottom in previous scroll, finish this round and then stop
    final_round_done = reached_end;
    console.log(`thread - position in thread:`, position);

    // Collect where we are
    let thread_contents = await thread_handle.evaluate((elem) => {
      return elem.outerHTML
    });
    // Scrolling up, so add the newest entry to the front
    thread_items.unshift( thread_contents );

    // Scroll to new spot
    position = await scroll_thread_up({ position, thread_handle });
    if (Math.abs(position) > 30000) {
      // Assume this thread is shorter than 30,000 pixels. Longer
      // ones will have to find their own way in the world.
      abort = true
      // await page.screenshot({path: `thread_up_${id}_${position}.jpg`});
    }
    // Decide if this is the last section we'll need to collect
    reached_end = await reached_thread_top({ thread_handle, id });
  }
  return thread_items;
}

async function scroll_to_thread_bottom ({ thread_handle, id, position }) {
  log.debug(`scroll_to_thread_bottom() position:`, position);
  let to_thread_bottom_count = 0;
  let abort = false;
  while ( !await reached_thread_bottom({ thread_handle }) && !abort ) {
    position = await scroll_thread_down({ position, thread_handle });
    to_thread_bottom_count++;
    if ( to_thread_bottom_count > 100 ) {
      // We're going to assume it's a bug and the thread isn't really
      // 200,000 pixels tall and there was just a pixel math problem
      console.log(`Thread with id "${ id }" was too long. Over ${ position } pixels.`)
      await page.screenshot({path: `scroll_to_thread_bottom_${ id }_${ position }.jpg`});
      abort = true;
    }
  }
}

// temp debugging
// let count = 0;
async function reached_thread_bottom ({ thread_handle }) {
  log.debug(`reached_thread_bottom()`);
  // temp debugging
  // console.log( thread_handle );

  // Might (rarely) be `null``
  const input_handle = await thread_handle.$(`div[data-item-key="input"]`);
  log.debug(`thread input handle:`, input_handle);
  // console.log( '----------', input_handle );
  if ( !input_handle ) {
    // temp debugging
    // await page.screenshot({path: `reached_thread_bottom_${count}.jpg`});
    // console.log(await thread_handle.evaluate((elem)=>{return elem.outerHTML}));
    // count++;

    // I'm not absolutely sure why this sometimes isn't there. I suspect it's
    // when the thread is too long, so we'll return that it's not the bottom.
    // Infinite loop should be prevented higher up.
    return false;
  }

  // Get "reply" input top position. The last thread element + some math
  // will be able to match input_top
  const reached_bottom = await input_handle.evaluate((input, thread) => {
    // Fragile

    // const input = thread.querySelector(`div[data-item-key="input"]`);
    const input_top = parseInt(window.getComputedStyle(input).getPropertyValue('top').replace('px', ''));

    // Get all thread posts
    const posts = Array.from(thread.querySelectorAll(`.c-virtual_list__item`));
    // For each thread post, check if its top matches the calculation
    for ( let post of posts ) {
      const item_bottom = post.clientHeight + parseInt(window.getComputedStyle(post).getPropertyValue('top').replace('px', ''))
      if ( item_bottom >= input_top ) {
        console.log( `\n\n`, post, `\n\n` );
        return true;
      }
    }
    return false;
  }, thread_handle);
  log.debug(`reached_bottom:`, reached_bottom);
  return reached_bottom;
}

async function scroll_thread_down ({ position, thread_handle }) {
  log.debug(`scroll_thread_down() start position: ${ position }`);
  const scroller_handle = await thread_handle.waitForSelector(`.c-scrollbar__hider`);
  position += await scroll_towards({
    direction: 1, position, goal_position: `bottom`, scroller_handle
  });
  log.debug(`scroll_thread_down() new position: ${ position }`);
  return position;
}

async function reached_thread_top ({ thread_handle, id }) {
  log.debug(`reached_thread_top() id:`, id);
  // TODO: Can probably get `id` from the thread handle, right?
  let top_handle = await thread_handle.$(`div[data-item-key="${id}"]`);
  log.debug(`top handle exists? (reached thread top): ${!!top_handle}, handle:`, top_handle);
  return !!top_handle;
}

async function scroll_thread_up ({ position, thread_handle }) {
  log.debug(`scroll_thread_up()`);
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
  await wait_for_movement({ seconds: 3 });
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
  write_file_safely({
    file_path: msgs_file_path,
    contents: JSON.stringify( messages, null, 2 ),
  });

  // Object of threads' html by id
  const threads_file_path = `${ folder_path }/${ config.threads_path }`;
  const threads = get_value_safely({ file_path: threads_file_path, default_value: {} });
  const new_threads = { ...threads, ...data.threads };
  write_file_safely({
    file_path: threads_file_path,
    contents: JSON.stringify( new_threads, null, 2 ),
  });
}

function save_state ({ config, state }) {
  log.debug(`save_state():`, state);
  const did_exist = write_file_safely({
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

function write_file_safely ({ file_path, contents }) {
  log.debug(`write_file_safely()`);
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
  },
  print_inline: function ({ message }) {
    process.stdout.write(`\x1b[36m${ message }\x1b[0m`);
  }
}


start();
