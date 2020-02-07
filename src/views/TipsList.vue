<template>
  <div>
    <div class="container">
      <div class="tips__container pt-3">
        <h2>Tip Explorer</h2>
        <p>
          Welcome to the aeternity Tips Explorer.
          <br> To start tipping and receiving tips install the <a href="https://waellet.com">waellet</a> extension
        </p>
        <div class="row actions__container mb-3">
          <div class="input-group col-md-6 col-sm-12">
            <input type="text" v-model="searchTerm" class="form-control" placeholder="Search for a tip record...">
            <!-- <div class="input-group-append">
              <span class="input-group-text">
                <img class="search-icon" src="../assets/search.svg">
              </span>
            </div> -->
          </div>
          <div class="col-md-6 col-sm-12 sorting">
            <a v-if="this.tipsOrdering" class="mr-2" v-on:click="sort('hot')"
               v-bind:class="{ active: sorting === 'hot' }">Hot</a>
            <a class="mr-2" v-on:click="sort('latest')" v-bind:class="{ active: sorting === 'latest' }">Latest</a>
            <a class="mr-2" v-on:click="sort('highest')" v-bind:class="{ active: sorting === 'highest' }">
              Highest Tipped
            </a>
          </div>
        </div>
        <div class="text-center spinner__container" v-bind:class="{ active: !showLoading }">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
        <div class="no-results mb-3 text-center" v-if="filteredTips !== null && filteredTips.length === 0">
          There are no results found
        </div>
        <div v-for="(tip,index) in filteredTips" :key="index" class="tip__record clearfix pt-2 pl-3 pr-3 mb-3">
          <div class="tip__body float-left">
            <div class="clearfix">
              <div class="tip__actions float-left  mr-2">
                <button class="btn btn-sm btn-light mr-1"><img src="../assets/heart.svg"></button>
              </div>
              <div class="tip__note float-left pr-2" :title="tip.note">
                {{ tip.note }}
              </div>
            </div>
            <div>
              <a class="tip__url mb-2 text-ellipsis pr-2" :title="tip.url" :href='tip.url'>{{tip.url}}</a>
            </div>
            <div class="tip__footer clearfix ml-n3 pl-3 pr-3 pb-1 pt-1 text-ellipsis">
              <div>
                <div class="float-left">
                  <span class="tip__date mr-2">
                    {{ new Date(tip.received_at).toLocaleString('en-US', { hourCycle: 'h24' }) }}
                  </span>
                </div>
                <div class="float-left">
                  <span class="tip__amount">
                    <img src="../assets/heart.svg"> +{{ tip.amount }} AE
                  </span>
                  by
                  <span class="tip__sender" :title="tip.sender">{{ tip.sender }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="tip__article float-right mt-n2 pt-2 pl-2 clearfix">
            <div class="left-arrow"></div>
            <div class="left-arrow filler"></div>
            <div class="tip__article--hasresults">
              <div class="text-ellipsis tip__article__caption">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              </div>
              <img src="https://via.placeholder.com/100x65" class="float-left mr-1">
              <span>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
              </span>
            </div>
            <div class="tip__article--noresults">
              No Preview Available
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import aeternity from '../utils/aeternity';
  import Backend from "../utils/backend";

  export default {
    name: 'TipsList',
    data() {
      return {
        showLoading: true,
        tips: null,
        tipsOrdering: null,
        searchTerm: '',
        sorting: "latest",
      }
    },
    computed: {
      filteredTips() {
        if (this.searchTerm.trim().length === 0) {
          return this.tips
        }
        let term = this.searchTerm.toLowerCase();

        let urlSearchResults = this.tips.filter(tip => {
          if (typeof tip.url !== 'undefined') {
            return tip.url.toLowerCase().includes(term)
          }
          return false
        })
        let senderSearchResults = this.tips.filter(tip => {
          if (typeof tip.sender !== 'undefined') {
            return tip.sender.toLowerCase().includes(term)
          }
          return false
        })
        let noteSearchResults = this.tips.filter(tip => {
          if (typeof tip.note !== 'undefined') {
            return tip.note.toLowerCase().includes(term)
          }
          return false
        })
        //We convert the result array to Set in order to remove duplicate records
        let convertResultToSet = new Set([...urlSearchResults, ...senderSearchResults, ...noteSearchResults]);
        return [...convertResultToSet];
      },

    },
    methods: {
      sort(sorting) {
        this.sorting = sorting;

        switch (this.sorting) {
          case "hot":
            this.tips.sort((a, b) => b.score - a.score);
            break;
          case "latest":
            this.tips.sort((a, b) => b.received_at - a.received_at);
            break;
          case "highest":
            this.tips.sort((a, b) => b.amount - a.amount);
            break;
        }
      },
      async reloadData(initial = false) {
        this.showLoading = true;

        const fetchTips = async () => {
          if (initial) await aeternity.initClient();
          return aeternity.getTips().catch(console.error);
        };
        const fetchOrdering = new Backend().tipOrder().catch(console.error);
        const [tips, tipOrdering] = await Promise.all([fetchTips(), fetchOrdering]);

        this.tipsOrdering = tipOrdering;

        if (this.tipsOrdering) {
          const blacklistedTipIds = tipOrdering.map(order => order.id);
          const filteredTips = tips.filter(tip => blacklistedTipIds.includes(tip.tipId));

          this.tips = filteredTips.map(tip => {
            const orderItem = tipOrdering.find(order => order.id === tip.tipId);
            tip.score = orderItem ? orderItem.score : 0;
            return tip;
          });

          if (initial) this.sorting = "hot";
        } else {
          this.tips = tips;
        }

        this.sort(this.sorting);
        this.showLoading = false;
      }
    },
    async created() {
      await this.reloadData(true);
      setInterval(() => this.reloadData(), 120 * 1000);
    },
  }
</script>


<style lang="scss" scoped>
  @import "../styles/base";

  .search-icon {
    height: 1rem;
  }

  .spinner__container{
    margin-bottom: 1rem;
    max-height: 200px;
    opacity: 100%;
    transition: max-height 0.25s ease-in, opacity 0.25s ease-in;

    &.active {
      max-height: 0;
      opacity: 0;
    }
  }

  .tips__container{
    width: 100%;
    h2,p{
      color: $standard_font_color;
      text-align: center;
    }
    p a{
      color: $custom_links_color;
    }
    .no-results{
      color: $standard_font_color;
      font-size: .75rem;
    }
    .actions__container{
      width: 100%;
      font-size: .75rem;
      margin: 0 1rem 1rem 0;
      .input-group{
        padding-left: 0;
        .form-control{
          background-color: $white_color;
          color: $standard_font_color;
          font-size: .75rem;
          border: 1px solid $white_color;
        }
        .input-group-text{
          background-color: $search_icon_backgound;
          border: 1px solid $white_color;
          &:hover{
            cursor: pointer;
            background-color: $primary_color;
            .fas.fa-search{
              color: $search_icon_hover_color;
            }
          }
          &:active{
             background-color: $secondary_color;
          }
        }
        .fas.fa-search{
          color: $standard_font_color;
        }
      }
      .sorting{
        background-color: $light_color;
        border-radius: .25rem;
        color: $light_font_color;
        text-align: left;
        padding: .45rem;
        padding-left: 1rem;
        a{
          font-weight: 700;
          &:hover{
            color: $primary_color;
            cursor: pointer;
          }
          &:active{
            color: $secondary_color;
          }
        }
        a.active{
          color: $secondary_color;
        }
      }
    }
    .tip__record{
      background-color: $article_content_color;
      border-radius: .25rem;
      .tip__actions{
       .btn-sm img{
         width: 1rem;
        }
      }
      .tip__body{
        width: calc(100% - 12rem);
        .tip__note{
          width: calc(100% - 3rem);
          font-size: .8375rem;
          font-weight: 700;
          color: $standard_font_color;
        }
        .tip__url{
          color: $custom_links_color;
          font-size: .75rem;
          cursor: pointer;
          display: block;
          overflow: visible;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .tip__footer{
          background-color: $light_color;
          font-size: .5rem;
          color: $light_font_color;
          border-bottom-right-radius: .25rem;
          border-bottom-left-radius: .25rem;
          .tip__amount{
            color: $secondary_color;
            font-weight: 700;
          }
          .tip__sender{
            color: $custom_links_color;
            font-weight: 700;
            font-size: .5rem;
          }
          .tip__totalsum, .tip__amount, .tip__comments, .tip__article__logo{
            img {
              width: .75rem;
              display: inline;
              margin-right: 2px;
            }
          }
          .tip__article__logo{
            font-weight: 700;
            .fa-facebook-f{
              color: #4267B2;
            }
          }
        }
      }
      .tip__article{
        width: 12rem;
        border-left: .05rem solid $border_color;
        min-height: 5.9rem;
        font-size: .5rem;
        position: relative;
        color: $standard_font_color;
        .tip__article__caption{
          font-size: .625rem;
          font-weight: 700;
          color: $standard_font_color;
        }
        img{
          width: 6rem;
          float: left;
          height: 4.125rem;
        }
        span{
          @include truncate-overflow-mx(6);
        }
        .left-arrow {
          @include vertical-align(absolute);
          border-color: transparent $border_color;
          border-style: solid;
          border-width: 10px 10px 10px 0px;
          height: 0px;
          width: 0px;
          left: -.6rem;
        }
        .left-arrow.filler{
          border-color: transparent $article_content_color;
          left: -.52rem;
        }
        .tip__article--hasresults{
          display: none;
        }
        .tip__article--noresults{
          display: none;
          width: 100%;
          text-align: center;
          @include vertical-align(absolute);
          font-size: .75rem;
          color: $light_font_color;
        }
      }
    }
    .tip__article{
      display: none;
    }
  }
  .tips__container .tip__record .tip__body{
      width: 100%;
  }
  .tips__container .tip__record .tip__body .tip__footer{
    margin-right: -1rem;
  }

@media only screen and (max-width: 768px){
  .tips__container .tip__record .tip__body .tip__url{
    font-size: .65rem;
  }
  .tips__container .tip__record .tip__body .tip__note{
    font-size: .7375rem;
  }
  .tips__container .actions__container .input-group{
    margin-bottom: 1rem;
    padding-right: 0;
  }
}

@media only screen and (max-width: 600px) {
  .tips__container .tip__record .tip__body .tip__note{
    font-size: .65rem;
  }
  .tips__container .tip__record .tip__actions .btn-sm img{
    width: .75rem
  }
  .tips__container .actions__container .input-group{
    margin-bottom: 1rem;
    padding-right: 0;
  }
  .tips__container .tip__record .tip__body .tip__footer .tip__amount img{
    width: .7rem;
  }
  .tips__container .tip__record .tip__body .tip__footer{
    font-size: .65rem;
    white-space: normal;
  }
}
</style>