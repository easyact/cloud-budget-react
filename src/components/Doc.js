export function Doc() {
    return <div className="content">
        <h1 className="page-header">
            教程
        </h1>
        {/*<a routerLink="/quickstart">快速开始</a>*/}
        <article id="financial-freedom">
            <h2>什么是财务自由？</h2>
            <p>
                简言之，就是<code>被动收入=支出</code>。
            </p>
        </article>
        <article id="passive-income">
            <h2>什么是被动收入？</h2>
            <p>
                与主动收入相对。<b>主动收入</b>也可称为劳动收入，就是需要用劳动换取的收入，不劳动就没有收入。
            </p>
            <p>而<b>被动收入</b>，也叫非劳动收入，就是即使不劳动，也存在的收入，俗话说的躺着都赚钱。形式包括房租、公司利润、版税、股利等。
                当你的被动收入超过你的生活支出的时候，你就可以辞职想干什么就干什么了。这就是“财务自由”。
            </p>
            <p>这是打工族与企业家/资本家的重要区别之一。</p>
        </article>
        <article id="why-startup">
            <h2>为什么要创业？</h2>
            <section className="columns">
                <div className="column is-9">
                    <p>
                        《穷爸爸富爸爸》一书针对财商有四象限的描述：ESBI。
                        横轴左右分别是主动收入、被动收入。
                    </p>
                    <ol>
                        <li>左上是雇员象限，拥有一份工作。</li>
                        <li>左下是自由职业者象限，做自己的老板。</li>
                        <li>右上是企业家象限，建立一个别人为你工作的系统。</li>
                        <li>右下是投资人象限，钱为你工作。</li>
                    </ol>
                    <p>成功创业，然后成为投资人——这是最理想的财务自由之路。
                        投资人投资一级市场——即未上市公司的股权——回报高风险大，因此创业经验能大幅提高其成功率。</p>
                </div>
                <img src="http://image-easyact-cn.oss-cn-shanghai.aliyuncs.com/CASHFLOW%20QuadrantESBI.gif"
                     className="column is-3" alt="四象限"/>
            </section>
        </article>
        <article id="why-software">
            <h2>为什么在软件领域创业？</h2>
            <p>软件业是近年来最激动人心的行业，通过软件几乎可以重构所有行业。而软件创业的成本几乎只包括人工一项。几乎为0的设备投资，让软件创业的门槛降到最低。</p>
            <p>最近流行的SaaS和互联网平台等商业模式，可以带来持续的现金流，是非常稳定的被动收入来源。</p>
        </article>
    </div>

}
