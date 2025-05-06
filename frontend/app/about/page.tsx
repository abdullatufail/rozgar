"use client";

import React from 'react';
import Image from 'next/image';
import { ScrollFadeIn } from '../../components/animations/ScrollFadeIn';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <ScrollFadeIn>
        <h1 className="text-4xl font-bold text-center mb-12">About Rozgaar</h1>
        
      </ScrollFadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <ScrollFadeIn>
          <div>
            <h2 className="text-3xl font-bold mb-6">Pakistan's Premier Freelance Marketplace</h2>
            <p className="text-lg text-gray-700 mb-6">
              Rozgaar was founded with a clear mission: to connect Pakistan's talented professionals 
              with clients seeking quality services, all while keeping economic value within our borders.
            </p>
            <p className="text-lg text-gray-700">
              As Pakistan's first locally developed freelance platform, we're proud to offer a space 
              where skills are valued, opportunities are created, and careers are built.
            </p>
          </div>
        </ScrollFadeIn>
        
        <ScrollFadeIn delay={0.2}>
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="https://via.placeholder.com/800x400/f0f0f0/666666?text=Pakistan+Freelancers" 
              alt="Pakistani freelancers working" 
              fill 
              style={{objectFit: "cover"}}
              className="rounded-lg"
            />
          </div>
        </ScrollFadeIn>
      </div>

      <ScrollFadeIn>
        <h2 className="text-3xl font-bold text-center mb-12">Why Rozgaar Leads in Pakistan</h2>
      </ScrollFadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <ScrollFadeIn delay={0.1}>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="bg-black text-white w-12 h-12 flex items-center justify-center rounded-full mb-4 text-xl font-bold">1</div>
            <h3 className="text-xl font-bold mb-4">Local Focus, Global Standards</h3>
            <p className="text-gray-700">
              Unlike international platforms, Rozgaar is built specifically for Pakistan's unique market needs, 
              while maintaining world-class quality and service standards.
            </p>
          </div>
        </ScrollFadeIn>
        
        <ScrollFadeIn delay={0.2}>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="bg-black text-white w-12 h-12 flex items-center justify-center rounded-full mb-4 text-xl font-bold">2</div>
            <h3 className="text-xl font-bold mb-4">Zero Foreign Currency Fees</h3>
            <p className="text-gray-700">
              By keeping transactions in local currency, we eliminate foreign exchange fees and banking complications
              that eat into freelancers' earnings on other platforms.
            </p>
          </div>
        </ScrollFadeIn>
        
        <ScrollFadeIn delay={0.3}>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="bg-black text-white w-12 h-12 flex items-center justify-center rounded-full mb-4 text-xl font-bold">3</div>
            <h3 className="text-xl font-bold mb-4">Local Payment Solutions</h3>
            <p className="text-gray-700">
              With seamless integration to Pakistani banks and mobile payment systems, getting paid has never been 
              easier for local freelancers.
            </p>
          </div>
        </ScrollFadeIn>
      </div>

      <div className="bg-gray-50 p-8 md:p-16 rounded-lg mb-20">
        <ScrollFadeIn>
          <h2 className="text-3xl font-bold text-center mb-8">Our Vision for Pakistan</h2>
          <p className="text-lg text-center text-gray-700 max-w-3xl mx-auto">
            Rozgaar aims to be the driving force behind Pakistan's digital economy growth, 
            helping to reduce brain drain by creating sustainable local opportunities. 
            We believe in the incredible talent of our nation and work tirelessly to showcase it 
            while building economic resilience through digital self-reliance.
          </p>
        </ScrollFadeIn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <ScrollFadeIn>
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold mb-6">Join the Rozgaar Community</h2>
            <p className="text-lg text-gray-700 mb-6">
              Whether you're a skilled professional looking for quality projects or a client seeking top talent in Pakistan,
              Rozgaar provides a secure, efficient, and user-friendly platform to connect.
            </p>
            <p className="text-lg text-gray-700">
              Join thousands of Pakistani freelancers and clients who are already part of our growing community and 
              experience the future of work in Pakistan.
            </p>
          </div>
        </ScrollFadeIn>
        
        <ScrollFadeIn delay={0.2} className="order-1 md:order-2">
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="https://via.placeholder.com/800x400/f0f0f0/666666?text=Rozgaar+Community" 
              alt="Rozgaar community" 
              fill 
              style={{objectFit: "cover"}} 
              className="rounded-lg"
            />
          </div>
        </ScrollFadeIn>
      </div>
    </div>
  );
} 