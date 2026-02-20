export default onPrerenderStart

async function onPrerenderStart(prerenderContext: any) {
  return { prerenderContext }
}
