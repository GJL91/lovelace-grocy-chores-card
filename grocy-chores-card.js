customElements.whenDefined('card-tools').then(() => {
  const cardTools = customElements.get('card-tools');

  const ONE_DAY_MILLIS = 24 * 60 * 60 * 1000;
  const DEFAULT_USER_ID = 1;
  const DEFAULT_UNKNOWN_DATE = "-";

  const DateDisplayFormat = {
    DATE: 'date',
    COUNTDOWN: 'countdown'
  };

  const ShowDaysType = {
    EXACT: 'exact',
    MIN: 'min',
    MAX: 'max'
  };

  class GrocyChoresCard extends cardTools.LitElement {

    setConfig(config) {
      if (!config.entity) {
        throw new Error('Please define entity');
      }

      this.config = config;
    }

    _calculateDueDate(dueDate) {
      if (!dueDate) {
        return -Infinity;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0)

      return Math.round((today.getTime() - dueDate.getTime()) / ONE_DAY_MILLIS) * -1;
    }

    _checkDueClass(dueInDays) {
      if (dueInDays == 0) {
        return "due-today";
      }

      return dueInDays < 0 && dueInDays !== -Infinity ? "overdue" : "not-due";
    }

    _formatDueDate(dueDate, dueInDays) {
      if (dueInDays == 0) {
        return this._translate("Today");
      }

      if (dueInDays === 1) {
        return this._translate("Tomorrow");
      }

      if (this.config.date_display_format === DateDisplayFormat.COUNTDOWN) {
        return this._formatToCountdown(dueInDays);
      }

      return dueInDays < 0 && dueInDays !== -Infinity ? this._translate("Overdue") : this._formatDate(dueDate);
    }

    _formatDate(date) {
      if (!date) {
        return DEFAULT_UNKNOWN_DATE;
      }

      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }

    _formatToCountdown(dueInDays) {
      if (dueInDays === -Infinity) {
        return DEFAULT_UNKNOWN_DATE;
      }

      const dateString = this._getCountdownString(Math.abs(dueInDays));
      return dueInDays > 0 ? dateString : `${dateString} ${this._translate("overdue")}`;
    }

    _getCountdownString(days) {
      if (days > 364) {
        const years = Math.round(days / 365);
        return `${years} ${this._pluralise('year', years)}`;
      }

      if (days > 30) {
        const months = Math.round(days / 30);
        return `${months} ${this._pluralise('month', months)}`;
      }

      if (days > 6) {
        const weeks = Math.round(days / 7);
        return `${weeks} ${this._pluralise('week', weeks)}`;
      }

      return `${days} ${this._pluralise('day', days)}`;
    }

    _pluralise(text, x) {
      return this._translate(`${text}${x > 1 ? 's' : ''}`);
    }

    _translate(value) {
      if (!this.config.custom_translation) {
        return value;
      }

      const translatedValue = this.config.custom_translation[value];
      return translatedValue ? translatedValue : value;
    }

    render() {
      if (!this.entity)
        return html`
      <hui-warning>
        ${this._hass.localize("ui.panel.lovelace.warning.entity_not_found",
          "entity",
          this.config.entity
        )}
      </hui-warning>
      `
      return cardTools.LitHtml
      `
        ${this._renderStyle()}
        ${cardTools.LitHtml
          `<ha-card>
            <div class="header">
              <div class="name">
                ${this.header}
              </div>
            </div>
            <div>
              ${this.chores.length > 0 ? cardTools.LitHtml`
              ${this.chores.map(chore =>
                cardTools.LitHtml`
                <div class="info flex">
                  <div>
                    ${chore._filtered_name ? chore._filtered_name : chore.name}
                    <div class="secondary">
                      ${this._translate("Due")}: <span class="${this._checkDueClass(chore.dueInDays)}">${this._formatDueDate(chore.next_estimated_execution_time, chore.dueInDays)}</span>
                    </div>
                    ${this.config.show_assigned !== false && chore.next_execution_assigned_user ? cardTools.LitHtml
                      `
                      <div class="secondary">
                        ${this._translate("Assigned to")}: ${chore.next_execution_assigned_user.display_name}
                      </div>
                      `
                    : ""}
                    ${this.config.show_last_tracked !== false ? cardTools.LitHtml
                      `
                      <div class="secondary">
                        ${this._translate("Last tracked")}: ${chore.last_tracked_time ? chore.last_tracked_time.substr(0, 10) : DEFAULT_UNKNOWN_DATE}
                        ${this.config.show_last_tracked_by !== false && chore.last_done_by ? this._translate("by") + " " + chore.last_done_by.display_name : ""}
                      </div>
                      `
                    : ""}
                  </div>
                  <div>
                    <mwc-button @click=${() => this._track(chore)}>${this._translate("Track")}</mwc-button>
                  </div>
                </div>`
              )}` : cardTools.LitHtml`<div class="info flex">${this._translate("No chores")}!</div>`}
            </div>
            ${this.notShowing > 0 ? cardTools.LitHtml
              `
              <div class="secondary">
                ${this._translate('Look in Grocy for {number} more chores').replace('{number}', this.notShowing)}
              </div>
              `
            : ""}
          </ha-card>`}
      `;
    } 

    _track(chore) {
      const userId = this._determineTrackingUser(chore);
      this._hass.callService("grocy", "execute_chore", {
        chore_id: chore.id,
        done_by: userId
      });
    }

    _determineTrackingUser(chore) {
      if (this.config.use_next_assignee_to_track !== false && chore.next_execution_assigned_user) {
        return chore.next_execution_assigned_user.id;
      }

      return this._getUserId();
    }

    _getUserId() {
      if (!this.config.user_id) {
        return DEFAULT_USER_ID;
      }

      // If it's defined and is a number, return the defined value
      if (this._isNumber(this.config.user_id)) {
        return this.config.user_id;
      }

      const username = this._hass.user.name;
      if (!username) {
        return DEFAULT_USER_ID;
      }

      const userId = this.config.user_id_case_insensitive !== false ? this._findCaseInsensitiveKey(this.config.user_id, username) : this.config.user_id[username];
      return userId ? userId : DEFAULT_USER_ID;
    }

    _findCaseInsensitiveKey(obj, key) {
      const searchKey = key.toLowerCase();
      return obj[Object.keys(obj).find(key => key.toLowerCase() === searchKey)];
    }

    _renderStyle() {
      return cardTools.LitHtml
        `
          <style>
            ha-card {
              padding: 16px;
            }
            .header {
              padding: 0;
              @apply --paper-font-headline;
              line-height: 40px;
              color: var(--primary-text-color);
              padding: 4px 0 12px;
            }
            .info {
              padding-bottom: 1em;
            }
            .flex {
              display: flex;
              justify-content: space-between;
            }
            .overdue {
              color: red !important;
            }
            .due-today {
              color: orange !important;
            }
            .secondary {
              display: block;
              color: #8c96a5;
          }
          </style>
        `;
    }

    set hass(hass) {
      this._hass = hass;
      this.entity = this.config.entity in hass.states ? hass.states[this.config.entity] : null;
      this.header = this.config.title == null ? "Chores" : this.config.title;
      this.notShowing = 0;

      if (!this.entity) {
        this.requestUpdate();
        return;
      }

      if (this.entity.state === 'unknown') {
        throw new Error("The Grocy sensor is unknown.");
      }

      let chores = this.entity.attributes.chores;
      if (chores != null) {
        chores = this._filterAndPreprocessChores(chores);
        chores.sort((a, b) => this._sort(a, b));
        this.chores = this._isNumber(this.config.show_quantity) ? chores.slice(0, this.config.show_quantity) : chores;
        this.notShowing = chores.length - this.chores.length;
      } else {
        this.chores = [];
      }

      this.state = this.entity.state
      this.requestUpdate();
    }

    _filterAndPreprocessChores(chores) {
      const exactDays = this._getDaysToShow(ShowDaysType.EXACT);
      const minDaysToShow = this._isNumber(exactDays) ? exactDays : this._getDaysToShow(ShowDaysType.MIN);
      const maxDaysToShow = this._isNumber(exactDays) ? exactDays : this._getDaysToShow(ShowDaysType.MAX);
      const filterDaysToShow = this._isNumber(minDaysToShow) || this._isNumber(maxDaysToShow);

      const filteredChores = [];
      chores.forEach(chore => {
        if (!this._filterChore(chore)) {
          return;
        }

        this._preprocessChore(chore);
        if (filterDaysToShow && !this._filterByDayRange(chore.dueInDays, minDaysToShow, maxDaysToShow)) {
          return;
        }

        filteredChores.push(chore);
      });

      return filteredChores;
    }

    _filterChore(chore) {
      if (this.config.filter) {
        if (!chore.name.includes(this.config.filter)) {
          return false;
        }

        if (this.config.remove_filter === true) {
          chore._filtered_name = chore.name.replace(this.config.filter, '');
        }
      }

      return !this.config.filter_user 
        || (chore.next_execution_assigned_user && chore.next_execution_assigned_user.id === this.config.filter_user);
    }

    _preprocessChore(chore) {
      if (chore.preprocessed) {
        return;
      }

      let dueDate = null;
      if (chore.next_estimated_execution_time) {
        const splitDate = chore.next_estimated_execution_time.split(/[- :T]/);
        dueDate = new Date(splitDate[0], splitDate[1] - 1, splitDate[2]);
        if (dueDate.getFullYear() === 2999) {
          dueDate = null;
        }

        chore.next_estimated_execution_time = dueDate;
      }

      chore.dueInDays = this._calculateDueDate(chore.next_estimated_execution_time);
      chore.preprocessed = true;
    }

    _filterByDayRange(dueInDays, minDaysToShow, maxDaysToShow) {
      return this._atLeastMinDays(dueInDays, minDaysToShow)
        && this._atMostMaxDays(dueInDays, maxDaysToShow);
    }

    _atLeastMinDays(dueInDays, minDaysToShow) {
      return !this._isNumber(minDaysToShow) || dueInDays >= minDaysToShow;
    }

    _atMostMaxDays(dueInDays, maxDaysToShow) {
      return !this._isNumber(maxDaysToShow) || dueInDays <= maxDaysToShow;
    }

    _sort(a, b) {
      const difference = a.dueInDays - b.dueInDays;
      return difference !== 0 ? difference : a.name.localeCompare(b.name);
    }

    _getDaysToShow(showDaysType) {
      if (!this.config.show_days) {
        return null;
      }

      switch (showDaysType) {
        case ShowDaysType.EXACT:
        case ShowDaysType.MIN:
          return this.config.show_days[showDaysType];
        case ShowDaysType.MAX:
          return this._getMaxDaysToShow()
        default:
          return null;
      }
    }

    _getMaxDaysToShow() {
      const maxDays = this.config.show_days[ShowDaysType.MAX];
      return this._isNumber(maxDays) ? maxDays : this.config.show_days;
    }

    _isNumber(value) {
      return value !== null && !isNaN(value);
    }

    // @TODO: This requires more intelligent logic
    getCardSize() {
      return 3;
    }
  }

  customElements.define('grocy-chores-card', GrocyChoresCard);
  });
  
  window.setTimeout(() => {
    if(customElements.get('card-tools')) return;
    customElements.define('grocy-chores-card', class extends HTMLElement{
      setConfig() { throw new Error("Can't find card-tools. See https://github.com/thomasloven/lovelace-card-tools");}
    });
  }, 2000);
