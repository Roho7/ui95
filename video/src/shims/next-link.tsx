import React from "react"

type LinkProps = Omit<React.ComponentProps<"a">, "href"> & { href: string | { pathname?: string }; prefetch?: boolean; replace?: boolean; scroll?: boolean }

const NEXT_ONLY = ["prefetch", "replace", "scroll"] as const

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const anchorProps: Record<string, unknown> = { ...props }
  NEXT_ONLY.forEach((key) => delete anchorProps[key])
  const href = typeof props.href === "string" ? props.href : props.href.pathname
  return <a ref={ref} {...(anchorProps as React.ComponentProps<"a">)} href={href} />
})

export default Link
