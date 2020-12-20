# grocy-chores-card

A Lovelace custom card for [custom component Grocy](https://github.com/custom-components/grocy) in Home Assistant.

![GitHub commit activity](https://img.shields.io/github/commit-activity/y/GJL91/lovelace-grocy-chores-card?style=for-the-badge)
[![GitHub issues](https://img.shields.io/github/issues/GJL91/lovelace-grocy-chores-card?style=for-the-badge)](https://github.com/GJL91/lovelace-grocy-chores-card/issues)

![Grocy Chores Card](https://github.com/GJL91/lovelace-grocy-chores-card/blob/524a88a4c00bcc89e37a8b2e489b9a6389628098/images/grocy-chores-card.png)

## Installation

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)
[![GitHub Release](https://img.shields.io/github/release/GJL91/lovelace-grocy-chores-card?style=for-the-badge)](https://github.com/GJL91/lovelace-grocy-chores-card/releases)
![GitHub Release Date](https://img.shields.io/github/release-date/GJL91/lovelace-grocy-chores-card?style=for-the-badge)

**This card reqires [card tools](https://github.com/thomasloven/lovelace-card-tools).**

### Install the plugin either via HACS (recommended) or manually
<details>
  <summary>HACS</summary>

  1. Add https://github.com/GJL91/lovelace-grocy-chores-card as a custom frontend repository.
  2. Click on "Install" under the new card that just popped up.
</details>
<details>
  <summary>Manual installation</summary>
  
  1. For manual installation see [this guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins).
</details>

### Add as a resource
<details>
  <summary>Lovelace configuration panel</summary>

**Note** instructions correct as of HomeAssistant 2020.12

1. Via the HomeAssistant UI, navigate to Configuration -> Lovelace Dashboards -> Resources -> Add Resource
2. Set the `URL` as `/hacsfiles/lovelace-grocy-chores-card/grocy-chores-card.js`
3. Set the `Resource Type` as `JavaScript Module`

![Lovelace Configuration Panel](https://github.com/GJL91/lovelace-grocy-chores-card/blob/524a88a4c00bcc89e37a8b2e489b9a6389628098/images/lovelace-config.png)
</details>
<details>
  <summary>Lovelace configuration YAML</summary>

  Add to the top of your lovelace configuration e.g.
  ```yaml
  title: My awesome Lovelace config
  resources:
    - url: /local/grocy-chores-card.js
      type: js
  ```
</details>

## Configuration

### Options

| Name | Type | Optional | Default | Description
| ---- | ---- | -------- | ------- | -----------
| type | string | **Required** |  | `custom:grocy-chores-card`
| entity | string | **Required** |  | The entity id of your Grocy chores sensor.
| title | string | **Optional** | `"Chores"` | The title of the card.
| show_quantity | number | **Optional** |  | The number of chores you want to show in the card.
| show_days | number | **Optional** |  | **Deprecated** - use show_days.max instead. Only show chores due in at most X days. For example, `7` to only show chores due within 7 days.
| show_days.exact | number | **Optional** |  | Only show chores due in exactly X days. For example, `0` to only show today's chores.
| show_days.min | number | **Optional** |  | Only show chores due in at least X days. For example, `0` to exclude overdue chores.
| show_days.max | number | **Optional** |  | Only show chores due in at most X days. For example, `7` to only show chores due within 7 days.
| user_id | number / string-list | **Optional** | `1` | Id of the Grocy user performing the tasks. Default if not specified is `1`, which should be the admin user in Grocy. Alternatively, you may supply a mapping of HomeAssistant usernames to Grocy user ids
| user_id_case_insensitive | bool | **Optional** | `true` | When supplying a mapping of HomeAssistant usernames to grocy user ids, treat usernames as case-insensitive
| use_next_assignee_to_track | bool | **Optional** | `true` | Whether to use the next assigned user when tracking a chore if one exists 
| custom_translation | string-list | **Optional** |  | List of translations of string values used in the card (see [below](#changing-default-text)).
| filter | string | **Optional** |  | Only show chores that contains this filter in the name.
| remove_filter | bool | **Optional** | `false` | Use together with `filter` to remove the filter from the name when showing in card. Chore name "Yard work: Clean rain gutters" with filter "Yard work: " will then only display "Clean rain gutters".
| filter_user | number | **Optional** |  | Only show chores assigned to the used with this user_id. Ex: `1`
| show_assigned | bool | **Optional** | `true` | Show who's assigned to the chore
| show_last_tracked | bool | **Optional** | `true` | Show when someone last tracked this chore
| show_last_tracked_by | bool | **Optional** | `true` | Show who last tracked this chore (`show_last_tracked` must be true to show this)
| date_display_format | string | **Optional** | `date` | Whether to show due dates as a `date` or a `countdown` (1 Day, 1 Week etc.)
| show_track_all_button | bool | **Optional** | `true` | Whether to show a button to track all displayed chores in the header

#### show_days options

* While `show_days` itself has been deprecated, it will currently continue to act the same as `show_days.max`.
* `show_days.exact` takes precedence over `min` & `max` - i.e. setting all options will result in only the `exact` option being considered.

#### Changing default text

It is possible to change the following default text to whatever you like. This can be used to translate the card to another language, or just to override the default text used.

<details>
<summary>Available translations</summary>

**Note** this list is case-sensitive
* Overdue
* overdue
* Today
* Tomorrow
* year
* years
* month
* months
* week
* weeks
* day
* days
* Track all
* Due
* Assigned to
* Last tracked
* by
* Track
* No chores
* Look in Grocy for {number} more chores
</details>

##### Example

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

### Example configuration

#### Show all kitchen chores
```yaml
type: 'custom:grocy-chores-card'
entity: sensor.grocy_chores
filter: 'Kitchen: '
remove_filter: true
custom_translation:
  Track: Done
  Track all: All done!
  Last tracked: Last done
date_display_format: countdown
user_id:
  john: 2
  jane: 3
```

#### Show only today's chores
```yaml
type: 'custom:grocy-chores-card'
entity: sensor.grocy_chores
title: Due Today
custom_translation:
  No chores: You're all done for today
date_display_format: countdown
show_days:
  exact: 0
user_id:
  john: 2
  jane: 3
```

#### Show chores due in the next 3 days, excluding today's chores
```yaml
type: 'custom:grocy-chores-card'
entity: sensor.grocy_chores
title: Upcoming chores
custom_translation:
  No chores: Nothing in the next 3 days
date_display_format: countdown
show_days:
  min: 1
  max: 3
user_id:
  john: 2
  jane: 3
```
