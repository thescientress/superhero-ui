<template>
  <div class="step__content step_3">
    <div class="step__figure">
      <img
        src="../../../assets/step_3_Image.svg"
        alt=""
      >
    </div>
    <i18n
      path="components.onboarding.steps.step3.header"
      tag="h1"
    >
      <template v-slot:br>
        <br>
      </template>
    </i18n>
    <i18n
      path="components.onboarding.steps.step3.info"
      tag="p"
    >
      <template v-slot:br>
        <br>
      </template>
      <template v-slot:pasteYourWallet>
        <span class="highlited">{{ $t('components.onboarding.steps.step3.pasteYourWallet') }}</span>
      </template>
      <template v-slot:openYourURL>
        <span class="highlited">{{ $t('components.onboarding.steps.step3.openYourURL') }}</span>
      </template>
    </i18n>
    <i18n
      class="highlited"
      path="components.onboarding.steps.step3.peaopleCanDirectlySupport"
      tag="p"
    >
      <template v-slot:br>
        <br>
      </template>
    </i18n>
    <div class="step__footer">
      <button
        class="button"
        @click="nextStep()"
      >
        {{ $t('components.onboarding.steps.step3.next') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Step3',
  methods: {
    nextStep() {
      this.$emit('wizard:next', this);
    },
  },
};
</script>
