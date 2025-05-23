import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlayTab from "@/pages/PlayTab";
import CreateTab from "@/pages/CreateTab";
import VoteTab from "@/pages/VoteTab";
import CollectionTab from "@/pages/CollectionTab";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [activeTab, setActiveTab] = useState("play");
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const openModal = (title: string, content: React.ReactNode) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-light">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <main className="container mx-auto p-4">
        {/* Tab content container */}
        <div className="tab-content mt-4">
          {activeTab === "play" && <PlayTab className="" />}
          {activeTab === "create" && <CreateTab className="" />}
          {activeTab === "vote" && <VoteTab className="" />}
          {activeTab === "collection" && <CollectionTab className="" />}
        </div>
      </main>

      <Footer />

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-pixel">{modalTitle}</DialogTitle>
          </DialogHeader>
          <DialogDescription>{modalContent}</DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
