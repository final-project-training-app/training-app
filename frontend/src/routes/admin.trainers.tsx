import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/trainers')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/trainers"!</div>
}
