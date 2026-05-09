import {usePrimeVue} from 'primevue/config'
import {all as locales} from 'primelocale'

export function setPrimeLocale(lang: string) {
  const primevue = usePrimeVue()

  Object.assign(
    primevue.config.locale!,
    locales[lang as keyof typeof locales]
  )
}
