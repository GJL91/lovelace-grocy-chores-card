customElements.whenDefined('card-tools').then(() => {
  let cardTools = customElements.get('card-tools');
    
  const ONE_DAY_MILLIS = 24 * 60 * 60 * 1000;
  const DEFAULT_USER_ID = 1;
  const DateDisplayFormat = {
    DATE: 'date',
    COUNTDOWN: 'countdown'
  };

  class GrocyChoresCard extends cardTools.LitElement {

    setConfig(config) {
      if (!config.entity) {
        throw new Error('Please define entity');
      }
      this.config = config;
    }
    
    _calculateDueDate(dueDate){
      let today = new Date();
      today.setHours(0,0,0,0)

      var splitDate = dueDate.split(/[- :T]/)
      var parsedDueDate = new Date(splitDate[0], splitDate[1]-1, splitDate[2]);
      parsedDueDate.setHours(0,0,0,0)
      
      return Math.round((today.getTime() - parsedDueDate.getTime()) / ONE_DAY_MILLIS) * -1;
    }

    _checkDueClass(dueInDays) {
      if (dueInDays == 0) {
        return "due-today";
      }

      return dueInDays < 0 ? "overdue" : "not-due";
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

      return dueInDays < 0 ? this._translate("Overdue") : dueDate.substr(0, 10);
    }

    _formatToCountdown(dueInDays) {
      let dateString = this._getCountdownString(Math.abs(dueInDays));
      return dueInDays > 0 ? dateString : `${dateString} ${this._translate("overdue")}`;
    }

    _getCountdownString(days) {
      if (days > 364) {
        let years = Math.round(days / 365);
        return `${years} ${this._pluralise('year', years)}`;
      }

      if (days > 30) {
        let months = Math.round(days / 30);
        return `${months} ${this._pluralise('month', months)}`;
      }

      if (days > 6) {
        let weeks = Math.round(days / 7);
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

      let translatedValue = this.config.custom_translation[value];
      return translatedValue ? translatedValue : value;
    }
  
    render(){
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
                    ${chore._filtered_name != null ? chore._filtered_name : chore.name}
                    <div class="secondary">
                      ${this._translate("Due")}: <span class="${chore.next_estimated_execution_time != null ? this._checkDueClass(chore.dueInDays) : ""}">${chore.next_estimated_execution_time != null ? this._formatDueDate(chore.next_estimated_execution_time, chore.dueInDays) : "-"}</span>
                    </div>
                    ${this.show_assigned == true && chore.next_execution_assigned_user != null ? cardTools.LitHtml
                      `
                      <div class="secondary">
                          ${this._translate("Assigned to")}: ${chore.next_execution_assigned_user.display_name}
                      </div>
                      `
                    : ""}
                    ${this.show_last_tracked == true ? cardTools.LitHtml
                      `
                    <div class="secondary">
                      ${this._translate("Last tracked")}: ${chore.last_tracked_time != null ? chore.last_tracked_time.substr(0, 10) : "-"}
                      ${this.show_last_tracked_by == true && chore.last_done_by != null ? this._translate("by") + " " + chore.last_done_by.display_name : ""}
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
                  ${this._translate(`Look in Grocy for ${this.notShowing} more chores`)}
              </div>
              `
            : ""}
          </ha-card>`}
      `;
    } 

    _track(chore){
      let userId = this._determineTrackingUser(chore);
      this._hass.callService("grocy", "execute_chore", {
        chore_id: chore.id,
        done_by: userId
      });
    }

    _determineTrackingUser(chore) {
      if (this.config.use_next_assignee_to_track !== false && chore.next_execution_assigned_user !== null) {
        return chore.next_execution_assigned_user;
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

      let username = this._hass.user.name;
      if (!username) {
        return DEFAULT_USER_ID;
      }

      let userId = this.config.user_id_case_insensitive !== false ? this._findCaseInsensitiveKey(this.config.user_id, username) : this.config.user_id[username];
      return userId ? userId : DEFAULT_USER_ID;
    }

    _findCaseInsensitiveKey(obj, key) {
      let searchKey = key.toLowerCase(); 
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

      this.filter = this.config.filter == null ? null : this.config.filter;
      this.filter_user = this.config.filter_user == null ? null : this.config.filter_user;
      this.remove_filter = this.config.remove_filter == null ? false : this.config.remove_filter;

      this.show_assigned = this.config.show_assigned == null ? true : this.config.show_assigned;
      this.show_last_tracked = this.config.show_last_tracked == null ? true : this.config.show_last_tracked;
      this.show_last_tracked_by = this.config.show_last_tracked_by == null ? true : this.config.show_last_tracked_by;

      if (this.entity) {
        if (this.entity.state == 'unknown')
          throw new Error("The Grocy sensor is unknown.");

        var chores = this.entity.attributes.chores;
        var allChores = []
  
        if (chores != null) {
          chores.sort(function(a,b){
            if (a.next_estimated_execution_time != null && b.next_estimated_execution_time != null) {
              var aSplitDate = a.next_estimated_execution_time.split(/[- :T]/)
              var bSplitDate = b.next_estimated_execution_time.split(/[- :T]/)
    
              var aParsedDueDate = new Date(aSplitDate[0], aSplitDate[1]-1, aSplitDate[2]);
              var bParsedDueDate = new Date(bSplitDate[0], bSplitDate[1]-1, bSplitDate[2]);
    
              return aParsedDueDate - bParsedDueDate;
            }
              return;
          })
  
          if (this.filter != null) {
            var filteredChores = [];
            for (let i = 0; i < chores.length; i++) {
              if (chores[i].name.includes(this.filter)) {
                if (this.remove_filter) {
                  chores[i]._filtered_name = chores[i].name.replace(this.filter, '');
                }
                filteredChores.push(chores[i]);
              }
            }
            chores = filteredChores;
          }
  
          if (this.filter_user != null) {
            var filteredChores = [];
            for (let i = 0; i < chores.length; i++) {
              if (chores[i].next_execution_assigned_user != null && chores[i].next_execution_assigned_user.id == this.filter_user) {
                filteredChores.push(chores[i]);
              }
            }
            chores = filteredChores;
          }
  
          chores.map(chore =>{
            var dueInDays = chore.next_estimated_execution_time ? this._calculateDueDate(chore.next_estimated_execution_time) : 10000;
            chore.dueInDays = dueInDays;
            if (this._isNumber(this.config.show_days)) {
              if (dueInDays <= this.config.show_days) {
                allChores.push(chore);
              } else if(chore.next_estimated_execution_time != null && chore.next_estimated_execution_time.slice(0,4) == "2999") {
                chore.next_estimated_execution_time = "-";
                allChores.unshift(chore)
              }
            } else {
              if (chore.next_estimated_execution_time == null || dueInDays == 10000 || chore.next_estimated_execution_time.slice(0,4) == "2999") {
                chore.next_estimated_execution_time = "-";
                allChores.unshift(chore)
              } else {
                allChores.push(chore);
              }
            }
          })
          
          if (this._isNumber(this.config.show_quantity)) {
            this.chores = allChores.slice(0, this.config.show_quantity);
            this.notShowing = allChores.length - this.config.show_quantity;
          } else {
            this.chores = allChores;
            this.notShowing = 0;
          }
        }
        else
          this.chores = allChores;
        
        this.state = this.entity.state
      }

      this.requestUpdate();
    }
    
    _isNumber(value) {
      return !isNaN(value);
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
