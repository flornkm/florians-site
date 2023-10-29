export type { PageContextServer }
export type { PageContextClient }
export type { PageContext }
export type { PageProps }

import { JSX } from "preact/jsx-runtime"
import type {
  PageContextBuiltInServer,
  /*
  PageContextBuiltInClientWithClientRouting as PageContextBuiltInClient
  /*/
  // When using Server Routing
  PageContextBuiltInClientWithServerRouting as PageContextBuiltInClient,
  //*/
} from "vike/types"

type Page = (pageProps: PageProps) => JSX.Element
type PageProps = Record<string, unknown>

export type PageContextCustom = {
  Page: Page
  pageProps?: PageProps
  urlPathname: string
  isHydration: boolean
  documentProps?: {
    title: string
    slug: string
    description: string
    image: string
  }
  config: {
    isProduction: boolean
    siteUrl: string
    title?: string
    description?: string
    image?: string
    noindex?: boolean
  }
  exports: {
    documentProps?: {
      title?: string
      description?: string
      image?: string
    }
  }
}

type PageContextServer = PageContextBuiltInServer<Page> & PageContextCustom
type PageContextClient = PageContextBuiltInClient<Page> & PageContextCustom

type PageContext = PageContextClient | PageContextServer
