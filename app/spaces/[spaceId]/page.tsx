import { redirect } from 'next/navigation';

interface PageProps {
  params: { spaceId: string };
}

export default function LegacySpaceDetailPage({ params }: PageProps) {
  redirect(`/space/${params.spaceId}`);
}
