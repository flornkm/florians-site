export default function Page({ is404 }: { is404: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>
        {is404 ? "404 – Page not found" : "500 – Server error"}
      </p>
    </div>
  )
}
