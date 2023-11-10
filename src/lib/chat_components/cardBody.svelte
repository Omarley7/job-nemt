<script lang="ts">
  let clazz = "";
  export { clazz as class };
</script>

<div class="jn-card jn-shadow-xl jn-bg-indigo-900 jn-h-full">
  <div class={`jn-card-body ${clazz} jn-p-6`}>
    <slot />
  </div>
</div>
