import { useEffect, useState } from "react";
import { acceptRequest, fetchRecivedRequests, rejectRequest } from "@/services/friendService";
import { Button } from "@/components/ui/button";