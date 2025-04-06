"use client";
import { AppStore, makeStore } from "@/lib/store";
import { useRef } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <Toaster
        position="bottom-right"
        visibleToasts={1}
        toastOptions={{
          classNames: {
            error:
              "bg-[#8A2A33] rounded-xl w-fit right-0 text-white text-base border-none",
          },
          className:
            "bg-[#6750A4] rounded-xl w-fit right-0 text-white text-base border-none",
        }}
      />
      {children}
    </Provider>
  );
}
