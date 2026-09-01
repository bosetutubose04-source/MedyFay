export interface DeliveryInfo {
  isAvailable: boolean;
  cityMatch: string;
  estimatedTime: string;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  message: string;
}

const SERVICEABLE_CITIES = [
  { keywords: ['kolkata', 'calcutta', 'salt lake', 'howrah', 'new town'], name: 'Kolkata', time: '25-35 mins', express: true },
  { keywords: ['sylhet', 'zindabazar', 'shahi eidgah', 'amberkhana'], name: 'Sylhet', time: '30-45 mins', express: true },
  { keywords: ['dhaka', 'gulshan', 'banani', 'dhanmondi', 'mirpur', 'uttara'], name: 'Dhaka', time: '35-50 mins', express: true },
  { keywords: ['mumbai', 'bombay', 'bandra', 'andheri', 'thane'], name: 'Mumbai', time: '30-45 mins', express: true },
  { keywords: ['bengaluru', 'bangalore', 'koramangala', 'whitefield', 'indiranagar'], name: 'Bengaluru', time: '25-40 mins', express: true },
  { keywords: ['delhi', 'noida', 'gurgaon', 'gurugram', 'faridabad'], name: 'Delhi NCR', time: '30-45 mins', express: true },
  { keywords: ['hyderabad', 'secunderabad', 'hitec city'], name: 'Hyderabad', time: '30-45 mins', express: true },
  { keywords: ['chennai', 'madras'], name: 'Chennai', time: '35-50 mins', express: true },
];

export function checkDeliveryAvailability(locationStr: string, orderSubtotal: number = 0): DeliveryInfo {
  const normalized = (locationStr || '').toLowerCase().trim();

  if (!normalized) {
    return {
      isAvailable: false,
      cityMatch: '',
      estimatedTime: '--',
      deliveryCharge: 100,
      freeDeliveryThreshold: 500,
      message: 'Please enter your delivery location'
    };
  }

  const matched = SERVICEABLE_CITIES.find(city => 
    city.keywords.some(keyword => normalized.includes(keyword))
  );

  if (matched) {
    const isFree = orderSubtotal >= 500;
    return {
      isAvailable: true,
      cityMatch: matched.name,
      estimatedTime: matched.time,
      deliveryCharge: isFree ? 0 : 50,
      freeDeliveryThreshold: 500,
      message: `Lightning Fast Express delivery available in ${matched.name} (${matched.time})`
    };
  }

  // Any other location: standard delivery available with standard time
  const isFree = orderSubtotal >= 500;
  return {
    isAvailable: true,
    cityMatch: locationStr,
    estimatedTime: '45-60 mins',
    deliveryCharge: isFree ? 0 : 70,
    freeDeliveryThreshold: 500,
    message: `Standard priority delivery available to ${locationStr} (45-60 mins)`
  };
}
