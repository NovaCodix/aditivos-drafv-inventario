export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-4 sm:p-8">
      <div className="w-full max-w-[420px] mx-auto">
        {children}
      </div>
    </div>
  )
}
