import { Event } from "../types/event";

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Princeton Symphony Orchestra: Fall Concert",
    date: "Nov 25, 2024",
    time: "7:30 PM",
    location: "Richardson Auditorium",
    description: "Join us for an evening of classical music featuring works by Beethoven, Mozart, and contemporary composers. The Princeton Symphony Orchestra brings together talented student musicians for a memorable performance.",
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
    category: "Music",
    isFree: true,
    hasFreeFood: false,
    hasOccurred: false,
    reviews: [
      {
        id: "r1",
        author: "Sarah M.",
        rating: 5,
        comment: "Amazing performance! The acoustics in Richardson are perfect.",
        date: "Nov 20, 2024"
      },
      {
        id: "r2",
        author: "Alex K.",
        rating: 4,
        comment: "Great talent, would recommend to anyone who loves classical music.",
        date: "Nov 19, 2024"
      },
      {
        id: "r2b",
        author: "Tom H.",
        rating: 5,
        comment: "The orchestra was incredible. Best concert I've been to this semester!",
        date: "Oct 15, 2024"
      }
    ]
  },
  {
    id: "2",
    title: "Tech Career Fair - Meet Industry Leaders",
    date: "Nov 27, 2024",
    time: "2:00 PM - 6:00 PM",
    location: "Frist Campus Center",
    description: "Connect with recruiters from top tech companies including Google, Microsoft, Amazon, and startup founders. Bring your resume and business casual attire. Free food provided!",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    category: "Career",
    isFree: true,
    hasFreeFood: true,
    hasOccurred: true,
    reviews: [
      {
        id: "r3",
        author: "James P.",
        rating: 5,
        comment: "Got two interviews! The recruiters were super friendly.",
        date: "Nov 15, 2024"
      },
      {
        id: "r3b",
        author: "Lisa W.",
        rating: 4,
        comment: "Well organized event. Make sure to arrive early for the best companies.",
        date: "Nov 15, 2024"
      }
    ]
  },
  {
    id: "3",
    title: "Late Night Pancakes & Study Break",
    date: "Nov 23, 2024",
    time: "10:00 PM - 12:00 AM",
    location: "Butler College Dining Hall",
    description: "Take a break from studying! Free pancakes, waffles, and toppings. Meet friends, destress, and fuel up for finals. All students welcome!",
    imageUrl: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80",
    category: "Social",
    isFree: true,
    hasFreeFood: true,
    hasOccurred: false,
    reviews: [
      {
        id: "r4",
        author: "Emily R.",
        rating: 5,
        comment: "Perfect study break! The pancakes were delicious 🥞",
        date: "Nov 10, 2024"
      },
      {
        id: "r5",
        author: "Mike T.",
        rating: 5,
        comment: "Great vibes and even better food. Exactly what I needed!",
        date: "Nov 10, 2024"
      },
      {
        id: "r5b",
        author: "Rachel K.",
        rating: 4,
        comment: "Always a good time. The chocolate chips are a must-have!",
        date: "Oct 25, 2024"
      }
    ]
  },
  {
    id: "4",
    title: "Guest Lecture: The Future of AI Ethics",
    date: "Nov 26, 2024",
    time: "4:30 PM",
    location: "McCosh 50",
    description: "Dr. Sarah Chen from MIT will discuss the ethical implications of artificial intelligence, machine learning bias, and the future of responsible AI development.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    category: "Academic",
    isFree: true,
    hasFreeFood: false,
    hasOccurred: false,
    reviews: [
      {
        id: "r6",
        author: "David L.",
        rating: 5,
        comment: "Fascinating talk! Really made me think about AI differently.",
        date: "Nov 12, 2024"
      },
      {
        id: "r6b",
        author: "Nina P.",
        rating: 5,
        comment: "Dr. Chen is an amazing speaker. The Q&A was especially insightful.",
        date: "Oct 20, 2024"
      }
    ]
  },
  {
    id: "5",
    title: "Salsa Night - Beginner Friendly!",
    date: "Nov 24, 2024",
    time: "8:00 PM - 11:00 PM",
    location: "Frist MPR",
    description: "No experience needed! Learn salsa dancing with our amazing instructors. First hour is beginner lessons, then social dancing. Refreshments provided.",
    imageUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&q=80",
    category: "Social",
    isFree: true,
    hasFreeFood: true,
    hasOccurred: true,
    reviews: [
      {
        id: "r7",
        author: "Maria G.",
        rating: 5,
        comment: "So much fun! Great way to meet new people and learn to dance.",
        date: "Nov 17, 2024"
      },
      {
        id: "r8",
        author: "Chris H.",
        rating: 4,
        comment: "Instructors were patient and the atmosphere was welcoming.",
        date: "Nov 17, 2024"
      },
      {
        id: "r8b",
        author: "Sophia L.",
        rating: 5,
        comment: "Even as a complete beginner, I felt comfortable. Highly recommend!",
        date: "Nov 17, 2024"
      }
    ]
  },
  {
    id: "6",
    title: "Mental Health & Wellness Workshop",
    date: "Nov 28, 2024",
    time: "3:00 PM",
    location: "Campus Center Room 210",
    description: "Join counselors from Counseling and Psychological Services for an interactive workshop on stress management, mindfulness techniques, and maintaining well-being during finals season.",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    category: "Wellness",
    isFree: true,
    hasFreeFood: false,
    hasOccurred: false,
    reviews: [
      {
        id: "r9",
        author: "Anna B.",
        rating: 5,
        comment: "Really helpful techniques. Felt much calmer after this.",
        date: "Nov 14, 2024"
      },
      {
        id: "r9b",
        author: "Kevin M.",
        rating: 5,
        comment: "The breathing exercises were game-changing. Will definitely use these during finals.",
        date: "Oct 28, 2024"
      }
    ]
  }
];