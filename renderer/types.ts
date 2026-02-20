export type { PageContext }

import { JSX } from "preact/jsx-runtime"
import type {
  PageContextBuiltInServer,
  PageContextBuiltInClientWithServerRouting as PageContextBuiltInClient,
} from "vike/types"

type Page = (pageProps: PageProps) => JSX.Element
type PageProps = Record<string, unknown>

type PageContextCustom = {
  Page: Page
  pageProps?: PageProps
  urlPathname: string
  isHydration: boolean
}

type PageContextServer = PageContextBuiltInServer<Page> & PageContextCustom
type PageContextClient = PageContextBuiltInClient<Page> & PageContextCustom

type PageContext = PageContextClient | PageContextServer
