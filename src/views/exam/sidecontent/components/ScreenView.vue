<script lang="jsx">
export default defineComponent({
  setup(props, { slots }) {
    const render = slots.default && slots.default()[0];
    return () => (
      <div class="w-screen position-fixed top-0 z-100 bg-#001727cf">
        {render}
      </div>
    );
  }
});
</script>
