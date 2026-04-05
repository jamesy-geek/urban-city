import { GovernmentSidebar } from "@/components/shared/GovernmentSidebar";
import { MobileNav } from "@/components/shared/MobileNav";
import styles from "./Layout.module.css";

export default function GovernmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <GovernmentSidebar />
      <main className={styles.main}>
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
