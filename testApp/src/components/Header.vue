<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div py-8>
    <RouterLink to="/">
      <h1 md:text-7xl text-5xl font-900 text-gray-700 dark:text-white>
        {{ t('header.main') }}
        <br>
        {{ t('header.main2') }}
      </h1>
      <h2 text-xl pt-6>
        {{ t('header.subtitle') }}
      </h2>
    </RouterLink>
  </div>
</template>

<style scoped>
h1 {
  background-image: linear-gradient(45deg, #4A75EF, #E7344D);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
