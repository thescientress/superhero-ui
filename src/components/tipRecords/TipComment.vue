<template>
  <div
    class="tip__record row position-relative comment"
    @click="goToURLPage(comment.tipId)"
  >
    <div class="tip__body">
      <div
        class="clearfix"
        @click.stop
      >
        <div
          class="tip__author"
          :title="comment.author"
        >
          <router-link :to="'/user-profile/' + comment.author">
            <Avatar :address="comment.author" />
            <span
              v-if="userChainName"
              class="chain__name"
            >
              {{ userChainName }}
            </span>
            <span
              v-else-if="comment.chainName"
              class="chain__name"
            >
              {{ comment.chainName }}
            </span>
            <span
              v-else
              :address="comment.author"
              class="address"
            >
              {{ comment.author }}
            </span>
          </router-link>
          <span class="tip__date">
            <format-date
              :date-timestamp="formatDate"
            />
          </span>
        </div>
      </div>
      <div
        class="tip__note"
        :title="comment.text"
      >
        {{ comment.text }}
      </div>
    </div>
  </div>
</template>

<script>

import FormatDate from './FormatDate.vue';
import Avatar from '../Avatar.vue';

export default {
  name: 'TipComment',
  components: {
    FormatDate,
    Avatar,
  },
  props: {
    comment: { type: Object, required: true },
    userChainName: { type: String, default: '' },
  },
  computed: {
    formatDate() {
      return new Date(this.comment.createdAt.substring(0, this.comment.createdAt.length - 8));
    },
  },
  methods: {
    goToURLPage(id) {
      this.$router.push({
        name: 'tip',
        params: {
          id,
        },
      });
    },
  },
};
</script>


<style lang="scss" scoped>
.comment.tip__record {
  padding-bottom: 0;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  background-color: $light_color;

  .tip__body .tip__note {
    padding: 0.35rem 1rem 1rem 1rem;
    color: $comment_text_color;
    height: initial;
    font-size: 0.7rem;
    font-weight: 400;
    margin: 0;
  }

  .tip__author {
    padding-bottom: 0;
  }
}

.tip__author {
  align-items: center;
  color: $light_font_color;
  display: flex;
  font-size: 0.8rem;
  justify-content: space-between;

  .tip__date {
    display: inline-block;
    font-size: 0.6rem;
    text-align: right;
  }

  .address {
    font-size: 0.6rem;
  }

  .address,
  .chain__name {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    word-break: break-all;
  }

  img {
    border-radius: 50%;
    flex-shrink: 0;
    height: 2rem;
    margin-right: 0.25rem;
    object-fit: cover;
    width: 2rem;
  }

  a {
    align-items: center;
    color: $light_font_color;
    display: flex;
    margin-right: 1rem;
    overflow: hidden;

    &:hover {
      filter: brightness(1.3);
    }
  }

  .chain__name {
    color: #fff;
  }

  .tip__author_name {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    width: 100%;
  }
}

@media only screen
  and (min-device-width: 320px)
  and (max-device-width: 480px)
  and (-webkit-min-device-pixel-ratio: 2) {
  .comment.tip__record {
    padding: 0.5rem;

    .tip__body {
      padding-left: 0;

      .tip__note {
        margin-top: 0.25rem;
        margin-bottom: 0;
        padding: 0;
      }
    }
  }
}
</style>
