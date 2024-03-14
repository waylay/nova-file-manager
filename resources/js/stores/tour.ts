import { defineStore } from 'pinia'
import Shepherd from 'shepherd.js'
import useBrowserStore from '@/stores/browser'
import Vue from 'vue'

const clickCurrentStepElement = () => {
    const currentStep = Shepherd.activeTour?.getCurrentStep()
    if (!currentStep)
        return
    const currentTargetElement = currentStep.getTarget()
    if (!currentTargetElement)
        return

    currentTargetElement.click()

}

const useTourStore = defineStore('nova-file-manager/tour', {
  state: () => ({
    tour: undefined as Shepherd.Tour | undefined,
  }),

  actions: {
    init() {
      const store = useBrowserStore()

      if (!store.tour) {
        return
      }

      if (this.alreadyDismissed()) {
        return
      }

      this.tour = new Shepherd.Tour({
        useModalOverlay: true,
        stepsContainer: document.getElementById('tour-container') ?? undefined
      })

      const self = this

      this.steps().forEach(step => {
        if (!document.querySelector(`[data-tour='${step.key}']`)) {
          return
        }

        const tourStep = self.tour?.addStep({
          id: step.key,
          title: step.title ?? undefined,
          text: `<div class="gap-2 flex flex-row items-center"><span class="mr-2 flex-shrink-0 rounded-lg bg-indigo-900/60 p-2">💡</span>${step.label}</div>`,
          attachTo: {
            element: () => `[data-tour="${step.key}"]`,
            on: (step.position ?? 'bottom-start') as Shepherd.Step.PopperPlacement,
          },
          arrow: false,
          scrollTo: false,
          classes: step.extraClasses,
          buttons: step.buttons ?? [
            {
              text: 'Previous',
              secondary: true,
              action: self.tour.back,
            },
            {
              text: 'Next',
              action: self.tour.next,
            },
          ],
          when: step.when ?? undefined,

        })

        if (step.preloadConfetti) {
          tourStep?.on('before-show', () => this.loadConfetti())
        }
      })

      this.tour.on('complete', async () => {
        const canvas = await self.showConfetti()
          store.tour = false;
        canvas.remove()
      })

      this.tour.start()
    },

    alreadyDismissed() {
      return !!window.localStorage.getItem('nova-file-manager/tour-dismissed')
    },

    dismiss() {
      window.localStorage.setItem('nova-file-manager/tour-dismissed', 'true')
    },

    loadConfetti() {
      const confettijs = document.createElement('script')

      confettijs.setAttribute('src', 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js')

      document.head.appendChild(confettijs)
    },

    async showConfetti() {
      return new Promise<HTMLCanvasElement & { confetti: any }>(resolve => {
        const canvas = document.createElement('canvas') as HTMLCanvasElement & { confetti: any }
        canvas.id = 'confetti-canvas'
        canvas.className = 'absolute bottom-0 left-0 w-full h-full pointer-events-none'
        document.body.appendChild(canvas)

        canvas.confetti = canvas.confetti || window.confetti.create(canvas, { resize: true })

        canvas.confetti({
          particleCount: 250,
          spread: 150,
          origin: { y: 1 },
        })

        setTimeout(() => {
          resolve(canvas)
        }, 5000)
      })
    },

    steps() {
      const self = this

      return [
        {
          title: 'My Library Dropdown',
          key: 'nfm-disk-selector',
          label: 'Select your media library or browse our free selection of banner images. Our selection of free stock images gives you a choice of banner images to use on your landing page.',
          buttons: [
            {
              label: 'Skip tour',
              text: 'Skip tour',
              secondary: true,
              action: () => {
                self.dismiss()

                self.tour?.complete()
              },
            },
            {
              label: 'Next',
              text: 'Next',
              action: self.tour?.next,
            },
          ]
        },
        {
          title: 'Number of visible images',
          key: 'nfm-pagination-selector',
          label: 'Change the maximum number of images that will be displayed on the Media Library page. If you have more images uploaded than the selected number of images to display on this page, you can move to the next page by scrolling to the bottom of this page and moving to the next page.',
        },
        {
          title: 'List View',
          key: 'nfm-view-toggle-list',
          label: 'Change the view to "List View" to see only the titles of the image files.',
        },

        {

          title: 'Image View',
          key: 'nfm-view-toggle-grid',
          label: 'Change the view to "Image View" to see your images.',
        },
        {

          title: 'Search',
          key: 'nfm-spotlight-search-button',
          label: 'If you are looking for an image, you can use this search to quickly find it by typing its name. You can also use this search to find free banner images that fit your purpose or industry.',
        },
        {
          key: 'nfm-create-folder-button',
          label: 'Opens a new modal to create a new folder',
        },
        {
          title: 'Upload',
          key: 'nfm-upload-file-button',
          label: 'Upload new images. You can also simply drag and drop one or more images into the library. Make sure that the size of each image is less than 3000kb otherwise an upload is not possible.',
        },
        {
          key: 'nfm-directory-grid',
          label: 'Here are your folders in the current path, you can go inside, rename or delete them',
        },
        {
          key: 'nfm-upload-browse-files',
          title: 'Use Image',
          label: 'To select and use an image, click on the desired image and confirm your selection by clicking on the " Accept" icon.',
          preloadConfetti: true,
          when: {
            show: clickCurrentStepElement
          }
        },
        {
          key: 'nfm-upload-crop-button',
          title: 'Cropping',
          label: 'You can crop any image you have added to your Media Library to make it fit perfectly into the format you need. By clicking on the crop icon, you can choose between the different formats (Free, Banner, Testimonial, Gallery) and move the grid to the perfect position. \n Don\'t forget to give your image a new name to make it easier to find later.',
          when: {
            'before-hide': clickCurrentStepElement
          },

        },

        {
          key: 'nfm-upload-pagination',
          label: 'Here are your files, a single click to select them, and double click to open a preview',
          position: 'bottom',
          scrollTo: false,
          buttons: [
            {
              label: 'Previous',
              text: 'Previous',
              secondary: true,
              action: self.tour?.back,
            },
            {
              label: 'Finish',
              text: '🎉 Done',
              action: () => {
                self.tour?.complete()
                self.dismiss()
              },
            },
          ],
        },
      ] as ({
        key: string
        label: string
        position: Shepherd.Step.PopperPlacement
        extraClasses?: string
        preloadConfetti?: boolean
      } & Shepherd.Step.StepOptions)[]
    },
  },
})

export default useTourStore
