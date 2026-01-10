import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Hotel, 
  Bed, 
  Clock, 
  Wifi, 
  Car, 
  Waves, 
  Dumbbell, 
  Sparkles,
  UtensilsCrossed,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2
} from "lucide-react";
import { useHotelSetup, HotelPropertyData, RoomTypeData } from "@/hooks/useHotelSetup";

const HotelSetup = () => {
  const navigate = useNavigate();
  const {
    business,
    businessId,
    existingHotel,
    currentStep,
    setCurrentStep,
    isLoading,
    createHotelProperty,
    addRoomType,
    completeSetup,
  } = useHotelSetup();

  // Redirect if hotel already exists
  useEffect(() => {
    if (existingHotel) {
      navigate(`/dashboard/hotel?business=${businessId}`);
    }
  }, [existingHotel, businessId, navigate]);

  // Property details state
  const [propertyData, setPropertyData] = useState<HotelPropertyData>({
    star_rating: 3,
    check_in_time: "14:00",
    check_out_time: "11:00",
    total_rooms: 10,
    wifi_available: true,
    parking_available: false,
    pool_available: false,
    gym_available: false,
    spa_available: false,
    restaurant_on_site: false,
    cancellation_policy: "Free cancellation up to 24 hours before check-in.",
    house_rules: "No smoking. No pets. Quiet hours from 10 PM to 7 AM.",
  });

  // Room types state
  const [roomTypes, setRoomTypes] = useState<RoomTypeData[]>([
    {
      name: "Standard Room",
      description: "Comfortable room with essential amenities",
      base_price_per_night: 100,
      max_occupancy: 2,
      quantity: 5,
      bed_configuration: "1 Queen Bed",
      room_size_sqm: 25,
      amenities: ["Air Conditioning", "TV", "Mini Fridge"],
    },
  ]);

  const [createdHotelId, setCreatedHotelId] = useState<string | null>(null);
  const [savingRooms, setSavingRooms] = useState(false);

  const steps = [
    { number: 1, title: "Property Details", icon: Hotel },
    { number: 2, title: "Room Types", icon: Bed },
    { number: 3, title: "Complete", icon: Check },
  ];

  const handlePropertySubmit = async () => {
    const result = await createHotelProperty.mutateAsync(propertyData);
    setCreatedHotelId(result.id);
  };

  const addNewRoomType = () => {
    setRoomTypes([
      ...roomTypes,
      {
        name: "",
        description: "",
        base_price_per_night: 0,
        max_occupancy: 2,
        quantity: 1,
        bed_configuration: "1 Queen Bed",
        room_size_sqm: 20,
        amenities: [],
      },
    ]);
  };

  const removeRoomType = (index: number) => {
    if (roomTypes.length > 1) {
      setRoomTypes(roomTypes.filter((_, i) => i !== index));
    }
  };

  const updateRoomType = (index: number, field: keyof RoomTypeData, value: any) => {
    const updated = [...roomTypes];
    updated[index] = { ...updated[index], [field]: value };
    setRoomTypes(updated);
  };

  const handleRoomsSubmit = async () => {
    if (!createdHotelId) return;
    
    setSavingRooms(true);
    try {
      for (const roomData of roomTypes) {
        if (roomData.name) {
          await addRoomType.mutateAsync({ hotelId: createdHotelId, roomData });
        }
      }
      setCurrentStep(3);
    } finally {
      setSavingRooms(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Business Not Found</h1>
          <p className="text-muted-foreground mb-6">
            Please make sure you have access to this business.
          </p>
          <Button onClick={() => navigate("/my-businesses")}>
            Go to My Businesses
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (business.business_type !== "hotel") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Business Type</h1>
          <p className="text-muted-foreground mb-6">
            This setup wizard is only for hotel businesses.
          </p>
          <Button onClick={() => navigate("/my-businesses")}>
            Go to My Businesses
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Set Up Your Hotel
          </h1>
          <p className="text-muted-foreground">
            Configure {business.name} to start accepting bookings
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground text-muted-foreground"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-24 md:w-32 h-0.5 mx-2 ${
                      currentStep > step.number ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        {/* Step 1: Property Details */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Property Details
              </CardTitle>
              <CardDescription>
                Configure your hotel's basic information and amenities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Star Rating & Room Count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Star Rating</Label>
                  <Select
                    value={propertyData.star_rating.toString()}
                    onValueChange={(v) =>
                      setPropertyData({ ...propertyData, star_rating: parseInt(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Star{rating > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Total Rooms</Label>
                  <Input
                    type="number"
                    min="1"
                    value={propertyData.total_rooms}
                    onChange={(e) =>
                      setPropertyData({
                        ...propertyData,
                        total_rooms: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>

              {/* Check-in/out Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Check-in Time
                  </Label>
                  <Input
                    type="time"
                    value={propertyData.check_in_time}
                    onChange={(e) =>
                      setPropertyData({ ...propertyData, check_in_time: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Check-out Time
                  </Label>
                  <Input
                    type="time"
                    value={propertyData.check_out_time}
                    onChange={(e) =>
                      setPropertyData({ ...propertyData, check_out_time: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: "wifi_available", label: "Free WiFi", icon: Wifi },
                    { key: "parking_available", label: "Parking", icon: Car },
                    { key: "pool_available", label: "Swimming Pool", icon: Waves },
                    { key: "gym_available", label: "Fitness Center", icon: Dumbbell },
                    { key: "spa_available", label: "Spa", icon: Sparkles },
                    { key: "restaurant_on_site", label: "Restaurant", icon: UtensilsCrossed },
                  ].map((amenity) => (
                    <div
                      key={amenity.key}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <amenity.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{amenity.label}</span>
                      </div>
                      <Switch
                        checked={propertyData[amenity.key as keyof HotelPropertyData] as boolean}
                        onCheckedChange={(checked) =>
                          setPropertyData({ ...propertyData, [amenity.key]: checked })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Policies */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Cancellation Policy</Label>
                  <Textarea
                    value={propertyData.cancellation_policy}
                    onChange={(e) =>
                      setPropertyData({ ...propertyData, cancellation_policy: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>House Rules</Label>
                  <Textarea
                    value={propertyData.house_rules}
                    onChange={(e) =>
                      setPropertyData({ ...propertyData, house_rules: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <Button
                  onClick={handlePropertySubmit}
                  disabled={createHotelProperty.isPending}
                >
                  {createHotelProperty.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Next: Add Rooms
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Room Types */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Room Types
              </CardTitle>
              <CardDescription>
                Add the different room types available at your hotel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {roomTypes.map((room, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Room Type {index + 1}</Badge>
                    {roomTypes.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRoomType(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Room Name</Label>
                      <Input
                        placeholder="e.g., Deluxe Suite"
                        value={room.name}
                        onChange={(e) => updateRoomType(index, "name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Price per Night (GHS)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={room.base_price_per_night}
                        onChange={(e) =>
                          updateRoomType(index, "base_price_per_night", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe this room type..."
                      value={room.description}
                      onChange={(e) => updateRoomType(index, "description", e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Max Guests</Label>
                      <Input
                        type="number"
                        min="1"
                        value={room.max_occupancy}
                        onChange={(e) =>
                          updateRoomType(index, "max_occupancy", parseInt(e.target.value) || 1)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={room.quantity}
                        onChange={(e) =>
                          updateRoomType(index, "quantity", parseInt(e.target.value) || 1)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Size (m²)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={room.room_size_sqm}
                        onChange={(e) =>
                          updateRoomType(index, "room_size_sqm", parseInt(e.target.value) || 20)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Bed Config</Label>
                      <Select
                        value={room.bed_configuration}
                        onValueChange={(v) => updateRoomType(index, "bed_configuration", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1 Single Bed">1 Single Bed</SelectItem>
                          <SelectItem value="2 Single Beds">2 Single Beds</SelectItem>
                          <SelectItem value="1 Double Bed">1 Double Bed</SelectItem>
                          <SelectItem value="1 Queen Bed">1 Queen Bed</SelectItem>
                          <SelectItem value="1 King Bed">1 King Bed</SelectItem>
                          <SelectItem value="2 Queen Beds">2 Queen Beds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addNewRoomType} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Another Room Type
              </Button>

              {/* Actions */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleRoomsSubmit} disabled={savingRooms}>
                  {savingRooms ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Rooms...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Complete */}
        {currentStep === 3 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Setup Complete!</CardTitle>
              <CardDescription>
                Your hotel is now ready to accept bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">{business.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {roomTypes.length} room type{roomTypes.length > 1 ? "s" : ""} configured
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground">What's next?</p>
                <ul className="text-sm text-left space-y-2 max-w-md mx-auto">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>View and manage your hotel dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Add images to your room types</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Set up seasonal pricing rules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Start receiving bookings!</span>
                  </li>
                </ul>
              </div>

              <Button onClick={completeSetup} size="lg">
                Go to Hotel Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default HotelSetup;
