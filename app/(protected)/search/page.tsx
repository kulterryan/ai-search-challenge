import { SearchInterface } from '@/components/search/SearchInterface';
import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
// import Image from 'next/image';

export const metadata : Metadata = {
  title: 'Astral Take Home Challenge'
}

export default async function Home() {

  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  
  return (
    <div className="flex flex-col items-center w-[600px] max-w-full mx-auto">
      <Suspense fallback={<div>Loading search...</div>}>
        <SearchInterface />
      </Suspense>
    </div>
  );
}