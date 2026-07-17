function MStripe({ className = '', thin = false }) {
  return (
    <div
      className={`${thin ? 'm-stripe-thin' : 'm-stripe'} ${className}`.trim()}
      aria-hidden
    />
  )
}

export default MStripe
