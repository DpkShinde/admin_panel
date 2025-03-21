'use client'
import { Table } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

const NavigationSubSideBar = () => {
  const router = useRouter();

  return (
    <div className="w-52 h-full dark:bg-[#2B2D31] bg-[#F2F3F5] border-r dark:border-[#202225] border-gray-200 ml-18">
      <div className="flex flex-col gap-2 p-4 ml-5">
        <div className="flex items-center py-2 px-2 rounded hover:bg-[#36393F] cursor-pointer"
          onClick={() => router.push('/database/stock-tables')}>
          <Table className="w-5 h-5 text-gray-400 mr-2" />
          <p className="text-sm text-gray-300 hover:text-white">Stock Tables</p>
        </div>
        <div className="flex items-center py-2 px-2 rounded hover:bg-[#36393F] cursor-pointer">
          <Table className="w-5 h-5 text-gray-400 mr-2" />
          <p className="text-sm text-gray-300 hover:text-white">Funds Tables</p>
        </div>
        <div className="flex items-center py-2 px-2 rounded hover:bg-[#36393F] cursor-pointer"
          onClick={() => router.push('/database/users')}>
          <Table className="w-5 h-5 text-gray-400 mr-2" />
          <p className="text-sm text-gray-300 hover:text-white">User Tables</p>
        </div>
        <div className="flex items-center py-2 px-2 rounded hover:bg-[#36393F] cursor-pointer">
          <Table className="w-5 h-5 text-gray-400 mr-2" />
          <p className="text-sm text-gray-300 hover:text-white">News Tables</p>
        </div>
        <div className="flex items-center py-2 px-2 rounded hover:bg-[#36393F] cursor-pointer"
          onClick={() => router.push('/database/blogs')}>
          <Table className="w-5 h-5 text-gray-400 mr-2" />
          <p className="text-sm text-gray-300 hover:text-white">Create Blogs</p>
        </div>
        <div className="flex items-center py-2 px-2 rounded hover:bg-[#36393F] cursor-pointer"
          onClick={() => router.push('/database/blogs/getblogs')}>
          <Table className="w-5 h-5 text-gray-400 mr-2" />
          <p className="text-sm text-gray-300 hover:text-white">Edit/Delete Blogs</p>
        </div>
      </div>
    </div>
  );
};

export default NavigationSubSideBar;
