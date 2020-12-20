# grocy-chores-card

[![GitHub Release](https://img.shields.io/github/release/GJL91/lovelace-grocy-chores-card?style=for-the-badge)](https://github.com/GJL91/lovelace-grocy-chores-card/releases)
![GitHub Release Date](https://img.shields.io/github/release-date/GJL91/lovelace-grocy-chores-card?style=for-the-badge)
![GitHub commit activity](https://img.shields.io/github/commit-activity/y/GJL91/lovelace-grocy-chores-card?style=for-the-badge)

[![GitHub issues](https://img.shields.io/github/issues/GJL91/lovelace-grocy-chores-card?style=for-the-badge)](https://github.com/GJL91/lovelace-grocy-chores-card/issues)

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

A Lovelace custom card for [custom component Grocy](https://github.com/custom-components/grocy) in Home Assistant.

<img src="https://github.com/isabellaalstrom/lovelace-grocy-chores-card/blob/master/grocy-chores-card.png" alt="Grocy Chores Card" />

Easiest installation via [HACS](https://custom-components.github.io/hacs/).

For manual installation see [this guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins).

**This card reqires [card tools](https://github.com/thomasloven/lovelace-card-tools).**

## Example configuration

```yaml
title: My awesome Lovelace config
resources:
  - url: /local/grocy-chores-card.js -or- /hacsfiles/lovelace-grocy-chores-card/grocy-chores-card.js
    type: js
views:
  title: My view
  cards:
    - type: custom:grocy-chores-card
      entity: sensor.grocy_chores
```

## Options

| Name | Type | Optional | Default | Description
| ---- | ---- | -------- | ------- | -----------
| type | string | **Required** |  | `custom:grocy-chores-card`
| entity | string | **Required** |  | The entity id of your Grocy chores sensor.
| title | string | **Optional** | `"Chores"` | The title of the card.
| show_quantity | number | **Optional** |  | The number of chores you want to show in the card.
| show_days | number | **Optional** |  | `7` to only show chores that's due within 7 days.
| user_id | number / string-list | **Optional** | `1` | Id of the Grocy user performing the tasks. Default if not specified is `1`, which should be the admin user in Grocy. Alternatively, you may supply a mapping of HomeAssistant usernames to Grocy user ids
| user_id_case_insensitive | bool | **Optional** | `true` | When supplying a mapping of HomeAssistant usernames to grocy user ids, treat usernames as case-insensitive
| use_next_assignee_to_track | bool | **Optional** | `true` | Whether to use the next assigned user when tracking a chore if one exists 
| custom_translation | string-list | **Optional** |  | List of translations of string values used in the card (see below).
| filter | string | **Optional** |  | Only show chores that contains this filter in the name.
| remove_filter | bool | **Optional** | `false` | Use together with `filter` to remove the filter from the name when showing in card. Chore name "Yard work: Clean rain gutters" with filter "Yard work: " will then only display "Clean rain gutters".
| filter_user | number | **Optional** |  | Only show chores assigned to the used with this user_id. Ex: `1`
| show_assigned | bool | **Optional** | `true` | Show who's assigned to the chore
| show_last_tracked | bool | **Optional** | `true` | Show when someone last tracked this chore
| show_last_tracked_by | bool | **Optional** | `true` | Show who last tracked this chore (`show_last_tracked` must be true to show this)
| date_display_format | string | **Optional** | `date` | Whether to show due dates as a `date` or a `countdown` (1 Day, 1 Week etc.)
| show_track_all_button | bool | **Optional** | `true` | Whether to show a button to track all displayed chores in the header

## Advanced options
It is possible to translate the following English strings in the card to whatever you like.

```yaml
custom_translation:
  Overdue: "Försenad"
  Today: "Idag"
  Due: "Dags"
  'Last tracked': "Senast"
  by: "av"
  Track: "Gör nu"
  'No chores': "Tom"
  'Look in Grocy for {number} more chores': "Det finns {number} fler göromål i Grocy"
```
