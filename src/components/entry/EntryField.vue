<script setup lang="ts">
import type { Field, EntryValue, EntryObject } from '@/lib/schema/types'
import StringField from './fields/StringField.vue'
import NumberField from './fields/NumberField.vue'
import BooleanField from './fields/BooleanField.vue'
import DateField from './fields/DateField.vue'
import UrlField from './fields/UrlField.vue'
import EnumField from './fields/EnumField.vue'
import ObjectField from './fields/ObjectField.vue'
import ArrayField from './fields/ArrayField.vue'

defineProps<{
  field: Field
  modelValue: EntryValue
  error?: string
  errors?: Record<string, string>
  variant?: 'full' | 'compact'
  pathPrefix?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: EntryValue] }>()
</script>

<template>
  <StringField
    v-if="field.type === 'string'"
    :field="field"
    :model-value="modelValue as string | null"
    :error="error"
    :variant="variant"
    @update:model-value="emit('update:modelValue', $event)"
  />
  <NumberField
    v-else-if="field.type === 'number'"
    :field="field"
    :model-value="modelValue as number | null"
    :error="error"
    :variant="variant"
    @update:model-value="emit('update:modelValue', $event)"
  />
  <BooleanField
    v-else-if="field.type === 'boolean'"
    :field="field"
    :model-value="modelValue as boolean | null"
    :error="error"
    :variant="variant"
    @update:model-value="emit('update:modelValue', $event)"
  />
  <DateField
    v-else-if="field.type === 'date'"
    :field="field"
    :model-value="modelValue as string | null"
    :error="error"
    :variant="variant"
    @update:model-value="emit('update:modelValue', $event)"
  />
  <UrlField
    v-else-if="field.type === 'url'"
    :field="field"
    :model-value="modelValue as string | null"
    :error="error"
    :variant="variant"
    @update:model-value="emit('update:modelValue', $event)"
  />
  <EnumField
    v-else-if="field.type === 'enum'"
    :field="field"
    :model-value="modelValue as string | null"
    :error="error"
    :variant="variant"
    @update:model-value="emit('update:modelValue', $event)"
  />
  <ObjectField
    v-else-if="field.type === 'object'"
    :field="field"
    :model-value="modelValue as EntryObject | null"
    :errors="errors"
    :variant="variant"
    :path-prefix="pathPrefix"
    @update:model-value="emit('update:modelValue', $event)"
  />
  <ArrayField
    v-else-if="field.type === 'array'"
    :field="field"
    :model-value="modelValue as EntryValue[] | null"
    :errors="errors"
    :variant="variant"
    :path-prefix="pathPrefix"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
