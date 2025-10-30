<template>
  <div class="toolbar">
    <TextFormatGroup :editor="editor" />
    <ColorPickerGroup :editor="editor" />
    <HeadingGroup :editor="editor" />
    <ListGroup :editor="editor" />
    <AlignmentGroup :editor="editor" />
    <MediaGroup :editor="editor" />
    <UtilityGroup :editor="editor" />
    <ActionGroup :editor="editor" />
  </div>
</template>

<script>
import TextFormatGroup from './TextFormatGroup.vue'
import ColorPickerGroup from './ColorPickerGroup.vue'
import HeadingGroup from './HeadingGroup.vue'
import ListGroup from './ListGroup.vue'
import AlignmentGroup from './AlignmentGroup.vue'
import UtilityGroup from './UtilityGroup.vue'
import MediaGroup from './MediaGroup.vue'
import ActionGroup from './ActionGroup.vue'

export default {
  name: 'EditorToolbar',
  components: {
    TextFormatGroup,
    ColorPickerGroup,
    HeadingGroup,
    ListGroup,
    AlignmentGroup,
    UtilityGroup,
    MediaGroup,
    ActionGroup
  },
  props: {
    editor: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.toolbar {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

/* Responsive */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>