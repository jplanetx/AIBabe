'use client';

import React from 'react';

const SignupForm = () => {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
          Full Name
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-gray-800 text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-gray-800 text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-gray-800 text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-gray-800 text-white"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 focus:ring-offset-gray-900"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
