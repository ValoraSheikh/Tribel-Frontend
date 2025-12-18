import * as React from "react";
import { PropertyProfile } from "./property-profile";
import { ManageRoomTemplate } from "../../room-template/components/manage-roomtemplate";

type PropertyIdProps = {
  propertyId: string;
};

export function ManageProperty({ propertyId }: PropertyIdProps) {
  return (
    <div>
      <PropertyProfile propertyId={propertyId} />

      <ManageRoomTemplate propertyId={propertyId} />
    </div>
  );
}
