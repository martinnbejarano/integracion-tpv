import { Button } from "@nextui-org/react";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { FaBell } from "react-icons/fa6";
import { MdOutlinePayment } from "react-icons/md";

export default function RestaurantHome({
  params: { restaurant },
}: {
  params: { restaurant: string };
}) {
  return (
    <main className="flex flex-col justify-center items-center gap-8 h-[100vh] bg-[#F6F6F6]">
      <Button
        className="w-2/3 h-24 text-2xl max-w-96"
        variant="flat"
        color="primary"
        startContent={<MdOutlineRestaurantMenu className="text-3xl" />}
      >
        Ver menú
      </Button>
      <Button
        className="w-2/3 h-24 text-2xl max-w-96"
        variant="flat"
        color="primary"
        startContent={<FaBell className="text-3xl" />}
      >
        Llamar al mesero
      </Button>
      <Button
        className="w-2/3 h-24 text-2xl max-w-96"
        variant="flat"
        color="primary"
        startContent={<MdOutlinePayment className="text-3xl" />}
      >
        Pedir la cuenta
      </Button>
    </main>
  );
}
