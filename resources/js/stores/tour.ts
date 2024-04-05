import { defineStore } from 'pinia'
import Shepherd from 'shepherd.js'
import useBrowserStore from '@/stores/browser'


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
        const tourStep = self.tour?.addStep({
          id: step.key,
          title: step.title ?? undefined,
          text: `<div class="gap-2 flex flex-row items-center"><span class="mr-2 flex-shrink-0 rounded-lg bg-indigo-900/60 p-2">💡</span>${step.label}</div>`,
          attachTo: {
            element: function () {
                if (document.querySelector(`[data-tour='${step.key}']`)) {
                    return `[data-tour="${step.key}"]`
                }
                return undefined;
            },
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

      })

      this.tour.on('complete', async () => {
          store.tour = false;
      })

      this.tour.start()
    },

    alreadyDismissed() {
      return !!window.localStorage.getItem('nova-file-manager/tour-dismissed')
    },

    dismiss() {
      window.localStorage.setItem('nova-file-manager/tour-dismissed', 'true')
    },


    steps() {
      const self = this

      return [

      ] as ({
        key: string
        label: string
        position: Shepherd.Step.PopperPlacement
        extraClasses?: string
        when?: Shepherd.Step.StepOptionsWhen
      } & Shepherd.Step.StepOptions)[]
    },
  },
})

export default useTourStore
