<template>
<div id="content">
    <div class='hello_world test'>{{ msg }}</div>
</div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello Vue!'
    }
  }
}
</script>

<style lang="scss" scoped>
  #content {

    white-space: nowrap;
    text-align: center;

    .hello_world {
      font-family: 'Roboto Condensed', sans-serif;
      font-size: 84px;
      margin-top: 50vh;
      transform: translateY(-50%);
     }
  }
</style>
