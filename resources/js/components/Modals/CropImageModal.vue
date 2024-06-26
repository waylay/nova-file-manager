<script setup lang="ts">
import { DialogPanel } from '@headlessui/vue'
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { Entity } from '__types__'
import 'cropperjs/dist/cropper.css'
import { computed, ref } from 'vue'
import { CropperData, default as VueCropper, VueCropperMethods } from 'vue-cropperjs'
import IconButton from '@/components/Elements/IconButton.vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import UploadCropModal from '@/components/Modals/UploadCropModal.vue'
import { UPLOAD_CROP_MODAL_NAME } from '@/constants'
import useBrowserStore from '@/stores/browser'

interface Props {
  file: Entity
  name: string
  onConfirm: (file: File) => void
}

const props = defineProps<Props>()

const store = useBrowserStore()

//STATE
const buttonRef = ref<HTMLButtonElement | HTMLAnchorElement>()
const cropper = ref<VueCropperMethods | null>(null)
const destFile = ref<File>()
const uploadIsOpen = computed(() => store.isOpen(UPLOAD_CROP_MODAL_NAME))
const cropperOptions = computed(() => store.cropperOptions)

const containerStyle = computed(() => ({
  height: '100%',
  minHeight: '60vh',
}))

const destName = computed(() => {
  const data = cropper.value?.getData() as CropperData

  const suffix = `${Math.round(data.width)}_${Math.round(data.height)}_${Math.round(data.x)}_${Math.round(data.y)}`

  return props.file?.name.replace(props.file?.extension, `${suffix}.${props.file?.extension}`)
})

// ACTIONS
const openModal = (name: string) => store.openModal({ name })
const closeModal = (name: string) => store.closeModal({ name })

const openUploadCropModal = () => {
  cropper.value?.getCroppedCanvas({
      maxWidth: 1920,
      maxHeight: 1080,
    }).toBlob((blob: Blob | null) => {
        if (!blob) {
          return
        }

        destFile.value = new File([blob], props.file.name, {
          type: props.file.mime,
        })

        openModal(UPLOAD_CROP_MODAL_NAME)
  }, props.file.mime)
}

const changeCropperAspectRatio = (ratio: number) => {
    cropper.value?.setAspectRatio(ratio)
}

const submitCrop = (name: string) => {
  if (!destFile.value) {
    return
  }

  const file = new File([destFile.value], name, {
    type: props.file.mime,
  })

  closeModal(UPLOAD_CROP_MODAL_NAME)
  closeModal(props.name)

  props.onConfirm(file)
}
</script>

<template>
  <BaseModal as="template" class="nova-file-manager" :name="name" v-slot="{ close }" :initial-focus-ref="buttonRef">
    <DialogPanel
      class="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-7xl p-4 flex flex-col gap-4 h-[80vh] max-h-[80vh]"
    >

      <div class="w-full flex flex-col flex-col-reverse gap-2 md:flex-row justify-between items-start">
        <h2 class="text-lg font-medium text-gray-900 dark:text-gray-400 break-all w-full">
          {{ __('NovaFileManager.actions.cropImage', { image: file.name }) }}
        </h2>

      <div class="flex flex-row gap-2 justify-end items-center flex-shrink-0 mr-6">
          <p class="font-medium text-gray-900 dark:text-gray-400 break-all w-full ">Use this image as:</p>
          <IconButton variant="transparent" @click="changeCropperAspectRatio(0)">
              Free
          </IconButton>
          <IconButton variant="transparent" @click="changeCropperAspectRatio(1440/379)">
              Banner
          </IconButton>
          <IconButton variant="transparent" @click="changeCropperAspectRatio(1/1)">
              Testimonial
          </IconButton>
          <IconButton variant="transparent" @click="changeCropperAspectRatio(625/405)">
              Gallery
          </IconButton>
      </div>
        <div class="flex flex-row gap-2 justify-end items-center flex-shrink-0">
          <IconButton ref="buttonRef" :title="__('NovaFileManager.actions.close')" @click.prevent.stop="close">
            <XMarkIcon class="w-5 h-5" />
          </IconButton>

          <IconButton variant="success" @click="openUploadCropModal">
            <CheckIcon class="h-5 w-5" />
          </IconButton>
        </div>
      </div>

      <div class="h-full max-h-[70vh]" data-tour="nfm-upload-crop-name">
        <vue-cropper
          ref="cropper"
          :containerStyle="containerStyle"
          :src="file.url"
          :alt="file.name"
          v-bind="cropperOptions"
        />
      </div>

      <UploadCropModal
        v-if="uploadIsOpen"
        :file="file"
        :name="UPLOAD_CROP_MODAL_NAME"
        :on-submit="submitCrop"
        :dest-file="destFile"
        :dest-name="destName"
      />
    </DialogPanel>
  </BaseModal>
</template>
