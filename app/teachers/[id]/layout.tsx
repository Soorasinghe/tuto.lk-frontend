import { Metadata } from "next";

// This function runs on the server before the page loads.
// It fetches the teacher's data and dynamically writes the SEO tags!
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`http://127.0.0.1:5001/api/teachers/${params.id}`, { 
      // Ensure we don't aggressively cache so new profile pics show up immediately
      cache: 'no-store' 
    });
    const json = await res.json();

    if (json.success && json.data) {
      const teacher = json.data;
      
      // Format the data for the preview cards
      const subjectList = teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects.join(" • ") : "Premium Tutor";
      const location = teacher.locations && teacher.locations.length > 0 ? teacher.locations[0].city : "Sri Lanka";
      const shortBio = teacher.bio ? teacher.bio.substring(0, 120) + '...' : 'Connect directly with this verified tutor on Tuto.lk to schedule your next class.';

      return {
        title: `${teacher.name} | ${subjectList} in ${location} | Tuto.lk`,
        description: shortBio,
        openGraph: {
          title: `${teacher.name} - Premium Tutor on Tuto.lk`,
          description: `Expert in ${subjectList} based in ${location}. View full track record, qualifications, and unlock contact details.`,
          url: `https://tuto.lk/teachers/${teacher.id}`, // Update this to your real domain later!
          siteName: "Tuto.lk",
          images: [
            {
              // Use their uploaded photo, or a generic platform banner if they don't have one
              url: teacher.profile_pic_url || "https://your-domain.com/default-social-preview.jpg", 
              width: 1200,
              height: 630,
              alt: `${teacher.name}'s Profile on Tuto.lk`,
            },
          ],
          locale: "en_LK",
          type: "profile",
        },
        twitter: {
          card: "summary_large_image",
          title: `${teacher.name} | Tuto.lk Premium Tutor`,
          description: `View ${teacher.name}'s verified tutor profile on Tuto.lk.`,
          images: [teacher.profile_pic_url || "https://your-domain.com/default-social-preview.jpg"],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  // Fallback SEO if the teacher isn't found or the API crashes
  return {
    title: "Tutor Profile | Tuto.lk",
    description: "View this premium tutor profile on Sri Lanka's top tuition platform.",
  };
}

export default function TeacherProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The actual client-side page.tsx will be rendered inside this children prop
  return <>{children}</>;
}