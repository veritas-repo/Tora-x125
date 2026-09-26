"use client";

import { useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import { Panel } from "@/components/UI";
import { assets } from "@/lib/mock-data";

export default function MarketPage() {
  const [selected, setSelected] = useState(assets[0]);
  const [side, setSide] = useState<"Buy"|"Sell">("Buy");

  return <main className="page">
    <HeroBanner eyebrow="SECONDARY MARKET" line1="Trade Real Assets." line2="Scale Real Impact." description="Programmable liquidity for verified climate assets across Ethereum and Base." />

    <section className="tickerGrid">
      {assets.map(a=><button key={a.symbol} onClick={()=>setSelected(a)} className={selected.symbol===a.symbol?"ticker activeTicker":"ticker"}><span>{a.icon}</span><div><b>{a.symbol}</b><small>{a.type}</small><strong>{a.price} <i className={a.change.startsWith("-")?"negative":"positive"}>{a.change}</i></strong></div></button>)}
    </section>

    <section className="marketGrid3">
      <Panel title="Markets">
        <div className="dataTable marketTable">
          <div className="marketTableRow headerRow"><span>Asset / Token</span><span>Price</span><span>24h</span><span>Volume</span><span>Liquidity</span><span>Action</span></div>
          {assets.map(a=><div className="marketTableRow" key={a.symbol}><span><b>{a.symbol}</b><small>{a.type}</small></span><b>{a.price}</b><b className={a.change.startsWith("-")?"negative":"positive"}>{a.change}</b><span>{a.volume}</span><span>{a.liquidity}</span><button className="miniGold" onClick={()=>setSelected(a)}>Trade</button></div>)}
        </div>
      </Panel>

      <section className="darkMarketPanel">
        <div className="darkMarketTop"><span>{selected.icon}</span><div><b>{selected.symbol}</b><small>{selected.type}</small></div><strong>{selected.price}<i className="positive">{selected.change}</i></strong></div>
        <div className="candles">{Array.from({length:18}).map((_,i)=><i key={i} style={{height: 30 + ((i*17)%90)}} />)}</div>
        <div className="marketFooter">Volume 125.4K <span>Uniswap v4 + 1inch</span></div>
      </section>

      <Panel title="">
        <div className="tabs"><button className={side==="Buy"?"selected":""} onClick={()=>setSide("Buy")}>Buy</button><button className={side==="Sell"?"selected":""} onClick={()=>setSide("Sell")}>Sell</button></div>
        <label className="fieldLabel">Asset</label><div className="selectMock">{selected.icon} <b>{selected.symbol}</b><span>⌄</span></div>
        <label className="fieldLabel">Order Type</label><div className="quickButtons"><button className="selected">Market</button><button>Limit</button><button>Stop</button></div>
        <label className="fieldLabel">Amount</label><div className="inputMock"><span>{selected.icon}</span><span>Enter amount</span><small>TORA</small></div>
        <div className="costLine"><span>Estimated Cost</span><b>-- USDC</b></div>
        <button className="goldBtn fullBtn">Review {side} Order</button>
      </Panel>
    </section>

    <section className="threeCol lower">
      <Panel title="Order Book – TORA-GB01"><div className="orderBook">{[["2,400","100.20","100.30","1,900"],["5,800","100.18","100.32","4,500"],["4,200","100.15","100.35","6,200"],["7,600","100.10","100.40","5,800"],["3,100","100.08","100.45","8,100"]].map((row,i)=><div key={i}><span>{row[0]}</span><b className="positive">{row[1]}</b><b className="negative">{row[2]}</b><span>{row[3]}</span></div>)}</div></Panel>
      <Panel title="Recent Trades"><div className="keyValues">{[["14:28:32","100.25","1,200","Buy"],["14:27:11","100.20","3,500","Sell"],["14:26:45","100.18","800","Buy"],["14:25:17","100.22","2,100","Sell"]].map(row=><span key={row[0]}>{row[0]} <b>{"$"+row[1]+" · "+row[2]+" TORA · "}<i className={row[3]==="Buy"?"positive":"negative"}>{row[3]}</i></b></span>)}</div></Panel>
      <Panel title="Liquidity & Market Info" action="View Pool"><div className="liquidityHero"><span>◉</span><div><b>$4.5M</b><small>Total Liquidity (USDC)</small></div></div><div className="miniMetrics"><div><b>0.08%</b><small>Spread</small></div><div><b>$1.2M</b><small>24h Volume</small></div><div><b>12.4%</b><small>30D Volatility</small></div></div></Panel>
    </section>
  </main>;
}
