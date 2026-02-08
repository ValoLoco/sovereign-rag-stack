import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Sovereign RAG Stack</h1>
      <p className="text-lg text-gray-600 mb-8">
        Hybrid local/cloud AI infrastructure with full data sovereignty
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Chat"
          description="Interact with your knowledge base"
          href="/chat"
        />
        <DashboardCard
          title="Documents"
          description="Manage your document library"
          href="/documents"
        />
        <DashboardCard
          title="Memories"
          description="View and search memories"
          href="/memories"
        />
      </div>
    </div>
  )
}

function DashboardCard({ title, description, href }: {
  title: string
  description: string
  href: string
}) {
  return (
    <a
      href={href}
      className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
    >
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </a>
  )
}
