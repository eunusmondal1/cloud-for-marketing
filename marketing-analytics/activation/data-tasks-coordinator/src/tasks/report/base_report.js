// Copyright 2019 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this fileAccessObject except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Interface for an external reporting task.
 */

'use strict';

const {TableSchema: BqTableSchema} = require('@google-cloud/bigquery');
const {
  api: {
    doubleclicksearch: {ReportRequest: Sa360ReportConfig},
    googleads: ReportQueryConfig,
    doubleclickbidmanager: {RequestBody: Dv360RequestBody},
    youtube: {ListChannelsConfig, ListVideosConfig},
  }
} = require('@google-cloud/nodejs-common');

/**
 * Campaign Manager report configuration.
 * @typedef {{
 *   accountId: string,
 *   profileId: string,
 *   reportId: string,
 * }}
 */
let CmReportConfig;

/**
 * DV360 (DoubleClick BidManager) report configuration.
 * For 'requestBody', see:
 * https://developers.google.com/bid-manager/v1.1/queries/runquery#request-body
 * @typedef {{
 *   queryId:string,
 *   requestBody: Dv360RequestBody | undefined,
 * }}
 */
let Dv360ReportConfig;

/**
 * GoogleAds report configuration
 * @typedef {{
 *   developerToken: string,
 *   customerId: string|undefined,
 *   loginCustomerId: string|undefined,
 *   reportQuery: ReportQueryConfig|undefined,
 * }}
 */
let AdsReportConfig;

/**
 * YouTube report configuration
 * @typedef {{
 *   target: string,
 *   resultLimit: number|undefined,
 *   reportQuery: ListChannelsConfig|ListVideosConfig|ListCommentThreadsConfig
 *     |ListPlaylistConfig|ListSearchConfig,
 * }}
 */
let YouTubeReportConfig;

/**
 * Options for extracts BigQuery Table to Cloud Storage file(s).
 * @typedef {{
 *   target: 'CM',
 *   config: CmReportConfig,
 * } | {
 *   target: 'DV360',
 *   config: Dv360ReportConfig,
 * } | {
 *   target: 'SA360',
 *   config: Sa360ReportConfig,
 * } | {
 *   target: 'ADS',
 *   config: AdsReportConfig,
 * } | {
 *   target: 'YT',
 *   config: YouTubeReportConfig,
 * }}
 */
let ReportConfig;

/**
 * The base class for a Report what will be used in ReportTask to generate and
 * download the report in a asynchronous way.
 * @abstract
 */
class Report {

  /** @param {ReportConfig} config */
  constructor(config) {
    this.config = config || {};
  }

  /**
   * Checks the given error message is a fatal error that should fail
   *  immediately without retry.
   * @param {string} errorMessage
   * @return {bool} Is a fatal error or not.
   */
  isFatalError(errorMessage) { return false; }

  /**
   * Starts to generate a report.
   * @param {Object<string,string>=} parameters Parameters of this instance.
   *     For example, 'config' defines the account id, report id, but to run a
   *     report, there could be detailed conditions, e.g. start date or end
   *     date, these can be passed in parameters.
   *     Same for the other two functions.
   * @return {!Promise<!Object<string,string>>} Information of external
   *     reporting job.
   */
  generate(parameters) { }

  /**
   * Checks whether the report is ready.
   * @param {Object<string,string>=} reportJobInformation
   * @return {!Promise<boolean>}
   */
  isReady(reportJobInformation) { }

  /**
   * Returns the content of the report.
   * @param {Object<string,string>=} reportJobInformation
   * @return {!Promise<string>} Report content
   */
  getContent(reportJobInformation) { }

  /**
   * Returns the schema of current report's data structure to help BigQuery load
   * the data into Table.
   * @return {!BqTableSchema} BigQuery load schema, see:
   *     https://cloud.google.com/bigquery/docs/schemas
   */
  generateSchema() {
    throw new Error('Unimplemented method.');
  }

  /**
   * Returns whether this report is asynchronous.
   * Different systems have different ways to return reports, synchronous or
   * asynchronous.
   * For synchronous ones, e.g. Google Ads, it will response reports at the
   * request immediately.
   * For asynchronous ones, e.g. Campaign Manager, it will return a 'fileId' to
   * the request of a report. You need to use the 'fileId' to check the status
   * manually. Then it's done, Campaign Manager will returns a 'fileUrl' which
   * is the report file.
   * So different reports determine whether this task is asynchronous.
   * @return {boolean}
   */
  isAsynchronous() {
    return true;
  }
}

module.exports = {
  ReportConfig,
  Report,
};
