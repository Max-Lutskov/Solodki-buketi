export default defineAppConfig({
  ui: {
    colors: {
      primary: 'wine',
      neutral: 'cocoa'
    },
    button: {
      slots: {
        base: 'rounded-full font-semibold'
      }
    },
    input: {
      slots: { base: 'rounded-xl' },
      defaultVariants: { variant: 'outline' }
    },
    select: {
      slots: { base: 'rounded-xl' }
    },
    textarea: {
      slots: { base: 'rounded-xl' }
    }
  }
})
