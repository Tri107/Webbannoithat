import { useEffect } from "react";
import { getMyProfile } from "@/lib/api";

export default function useCheckoutProfile(setShippingData) {
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        const result = await getMyProfile();

        if (result?.data) {
          setShippingData((prev) => ({
            ...prev,
            fullName: result.data.username || "",
            phone: result.data.phone_number || "",
            email: result.data.email || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch profile info", err);
      }
    };

    fetchProfile();
  }, [setShippingData]);
}
