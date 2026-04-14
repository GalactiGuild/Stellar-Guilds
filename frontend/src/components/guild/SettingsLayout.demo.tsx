'use client';

import React from 'react';
import { SettingsLayout } from './SettingsLayout';

/**
 * Demo page showcasing the Guild Settings Layout.
 * Uses dummy router hooks (no actual routing required).
 */
export default function SettingsLayoutDemo(): JSX.Element {
  return (
    <SettingsLayout guildName="Stellar Builders Guild">
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            General Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your guild&apos;s basic information and configuration.
          </p>
        </div>

        {/* Mock form */}
        <div className="max-w-2xl space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Guild Profile
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="guild-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Guild Name
                </label>
                <input
                  id="guild-name"
                  type="text"
                  defaultValue="Stellar Builders Guild"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="guild-desc"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="guild-desc"
                  rows={3}
                  defaultValue="A community of Stellar ecosystem builders."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
