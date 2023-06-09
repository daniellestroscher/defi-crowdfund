import React, { useEffect, useState } from "react";
import Head from "next/head";
import styles from "../styles/pages/discover.module.css";
import NavBar from "../src/components/navBar";
import CategoryList from "../src/components/categoryList";
import { filterFunds } from "../src/helperFunctions";

import { Crowdfund, CrowdfundWithMeta, NetworkMappingType } from "../src/types";
import networkMapping from "../src/constants/networkMapping.json";
import MarketArtifact from "../src/constants/CrowdfundMarketplace.json";

import axios from "axios";

import { useAccount, useNetwork } from "wagmi";
import { readContract } from "@wagmi/core";

import LandingPage from "./landing-page";
import { act } from "@testing-library/react";

export default function Home() {
  const networkMappingTyped = networkMapping as NetworkMappingType;
  const { chain } = useNetwork();

  const [hasMounted, setHasMounted] = useState(false);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [crowdfundArr, setCrowdfundArr] = useState<CrowdfundWithMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { isConnected, address } = useAccount();

  useEffect(() => {
    setHasMounted(true);
    if (isConnected) {
      loadCrowdfunds();
    }
  }, [isConnected, address, chain]);

  if (!hasMounted) {
    return null;
  }

  async function loadCrowdfunds() {
    const MarketAddress =
      networkMappingTyped[chain!.id]["CrowdfundMarketplace"][0];
    const allActiveFundraisers = (await readContract({
      address: MarketAddress as `0x${string}`,
      abi: MarketArtifact,
      functionName: "getActiveFundraisers",
    })) as Crowdfund[];

    const crowdfundList = (await Promise.all(
      allActiveFundraisers.map(async (crowdfund: Crowdfund) => {
        const meta = await axios.get(crowdfund.metaUrl);
        return {
          fundId: Number(crowdfund.fundId),
          crowdfundContract: crowdfund.crowdfundContract,
          name: meta.data.name,
          descriptionShort: meta.data.descriptionShort,
          descriptionLong: meta.data.descriptionLong,
          image: meta.data.image,
          category: meta.data.category,
          owner: crowdfund.owner,
          goal: Number(crowdfund.goal),
          goalReached: crowdfund.goalReached,
        };
      })
    )) as CrowdfundWithMeta[];

    setCrowdfundArr(crowdfundList);
    setLoadingState("loaded");
  }

  const searchableCrowdfunds = filterFunds(crowdfundArr, searchQuery);

  return (
    <>
      <Head>
        <title>Vista Fundraising</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <NavBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {!isConnected && <LandingPage />}
        {loadingState === "loaded" && !crowdfundArr.length && isConnected && (
          <div className={styles.page}>
            <p className={styles.pageHeading}>
              No fundraisers in this marketplace.
            </p>
          </div>
        )}
        {crowdfundArr.length !== 0 && isConnected && (
          <section>
            <CategoryList
              category={"Environment & Wildlife"}
              list={searchableCrowdfunds}
            />
            <CategoryList category={"Children"} list={searchableCrowdfunds} />
            <CategoryList category={"Poverty"} list={searchableCrowdfunds} />
            <CategoryList category={"Research"} list={searchableCrowdfunds} />
            <CategoryList category={"Other"} list={searchableCrowdfunds} />
          </section>
        )}
      </main>
    </>
  );
}
